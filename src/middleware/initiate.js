'use strict'

const uuid = require('uuid')
const {DateTime} = require('luxon')

const logger = require('../logger')
const {OPENHIM_TRANSACTION_HEADER} = require('../constants')
const {endpointCache} = require('../db/services/endpoints/cache')
const statesService = require('../db/services/states')
const {constructOpenhimResponse} = require('../openhim')
const {
  extractValueFromObject,
  handleServerError,
  extractRegexFromPattern
} = require('../util')

const extractByType = (type, extract, allData) => {
  let state = {}

  if (!type || !extract || !allData) {
    return state
  }

  Object.keys(extract[type]).forEach(prop => {
    const value = extractValueFromObject(allData[type], extract[type][prop])
    state[prop] = value
  })
  return state
}

const extractStateValues = (ctx, extract) => {
  const allData = ctx.state.allData
  let updatedState = {}

  // always add timestamps to the endpoint state
  ctx.state.allData.timestamps.endpointEnd = DateTime.utc().toISO()
  ctx.state.allData.timestamps.endpointDuration = DateTime.fromISO(
    ctx.state.allData.timestamps.endpointEnd
  )
    .diff(DateTime.fromISO(ctx.state.allData.timestamps.endpointStart))
    .toObject()
  updatedState.system = {
    timestamps: ctx.state.allData.timestamps
  }

  if (!extract) {
    return updatedState
  }

  if (extract.requestBody && Object.keys(extract.requestBody).length > 0) {
    updatedState.requestBody = extractByType('requestBody', extract, allData)
  }

  if (extract.responseBody && Object.keys(extract.responseBody).length > 0) {
    updatedState.responseBody = extractByType('responseBody', extract, allData)
  }

  if (extract.query && Object.keys(extract.query).length > 0) {
    updatedState.query = extractByType('query', extract, allData)
  }

  if (
    extract.lookupRequests &&
    Object.keys(extract.lookupRequests).length > 0
  ) {
    updatedState.lookupRequests = extractByType(
      'lookupRequests',
      extract,
      allData
    )
  }

  return updatedState
}

const updateEndpointState = async (ctx, endpoint) => {
  if (!endpoint || Object.keys(endpoint).length === 0) {
    throw new Error('No metaData supplied for updating state for this endpoint')
  }

  if (!endpoint.state || Object.keys(endpoint).length === 0) {
    return logger.info(
      `${endpoint.name} (${ctx.state.uuid}): No state configuration for this endpoint`
    )
  }

  const updatedState = extractStateValues(ctx, endpoint.state.extract)

  updatedState._endpointReference = endpoint._id

  // send update to mongo
  await statesService
    .createEndpointState(updatedState)
    .then(() => {
      return logger.info(
        `${endpoint.name} (${ctx.state.uuid}): Captured request state`
      )
    })
    .catch(error => {
      throw Error(error)
    })
}

const getEndpointByPath = urlPath => {
  let matchedEndpoint
  let urlParams = {}

  for (let endpoint of endpointCache) {
    if (endpoint.endpoint.pattern === urlPath) {
      return {endpoint: endpoint, urlParams}
    }

    const match = urlPath.match(
      extractRegexFromPattern(endpoint.endpoint.pattern)
    )

    if (match) {
      urlParams = match.groups ? match.groups : {}
      matchedEndpoint = endpoint
    }
  }

  return {endpoint: matchedEndpoint, urlParams}
}

exports.initiateContextMiddleware = () => async (ctx, next) => {
  // set the initial start time for entry into the endpoint
  const endpointStart = DateTime.utc().toISO()
  // set request UUID from incoming OpenHIM header if present, else create a random UUID
  const requestUUID = ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
    ? ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
    : uuid.v4()

  const {endpoint, urlParams} = getEndpointByPath(ctx.request.path)

  if (!endpoint) {
    logger.error(`Unknown Endpoint: ${ctx.request.path}`)

    ctx.response.type = 'application/json'
    ctx.status = 404
    ctx.response.body = {error: `Unknown Endpoint: ${ctx.request.path}`}

    if (
      ctx.request.headers &&
      ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
    ) {
      constructOpenhimResponse(ctx, Date.now())
    }
    return
  }

  const endpointState = await statesService.readLatestEndpointStateById(
    endpoint._id
  )

  logger.info(`${endpoint.name} (${requestUUID}): Initiating new request`)

  // initiate the property for containing all useable data points
  ctx.state.allData = {
    constants: endpoint.constants,
    state: endpointState,
    urlParams: urlParams,
    timestamps: {
      endpointStart,
      endpointEnd: null,
      lookupRequests: {}
    }
  }

  ctx.state.uuid = requestUUID
  ctx.state.metaData = endpoint
  await next()

  try {
    // update any specified state for this endpoint request
    updateEndpointState(ctx, endpoint)
  } catch (error) {
    return handleServerError(
      ctx,
      'Failed to update endpoint state: ',
      error,
      logger
    )
  }
}
