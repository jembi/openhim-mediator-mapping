'use strict'

const uuid = require('uuid')
const {DateTime} = require('luxon')

const logger = require('../logger')
const {extractValueFromObject} = require('../util')

const extractStateValues = (ctx, extract) => {
  if (
    !extract ||
    (!extract.system &&
      !extract.requestBody &&
      !extract.responseBody &&
      !extract.query &&
      !extract.lookupRequests)
  ) {
    return logger.info(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): State extract definitions not supplied for this endpoint`
    )
  }

  const allData = ctx.state.allData
  let updatedState = {}

  if (extract.system && Object.keys(extract.system).length > 0) {
    let systemState = {}
    if (extract.system.timestamps) {
      ctx.state.allData.timestamps.endpointEnd = DateTime.utc().toISO()
      ctx.state.allData.timestamps.endpointDuration = DateTime.fromISO(
        ctx.state.allData.timestamps.endpointEnd
      )
        .diff(DateTime.fromISO(ctx.state.allData.timestamps.endpointStart))
        .toObject()
      Object.assign(systemState, ctx.state.allData.timestamps)
    }

    updatedState.system = systemState
  }

  if (extract.requestBody && Object.keys(extract.requestBody).length > 0) {
    let requestBodyState = {}
    Object.keys(extract.requestBody).forEach(prop => {
      const requestBodyValue = extractValueFromObject(
        allData.requestBody,
        extract.requestBody[prop]
      )
      requestBodyState[prop] = requestBodyValue
    })
    updatedState.requestBody = requestBodyState
  }

  if (extract.responseBody && Object.keys(extract.responseBody).length > 0) {
    let responseBodyState = {}
    Object.keys(extract.responseBody).forEach(prop => {
      const responseBodyValue = extractValueFromObject(
        allData.responseBody,
        extract.responseBody[prop]
      )
      responseBodyState[prop] = responseBodyValue
    })
    updatedState.responseBody = responseBodyState
  }

  if (extract.query && Object.keys(extract.query).length > 0) {
    let queryState = {}
    Object.keys(extract.query).forEach(prop => {
      const queryValue = extractValueFromObject(
        allData.query,
        extract.query[prop]
      )
      queryState[prop] = queryValue
    })
    updatedState.query = queryState
  }

  if (
    extract.lookupRequests &&
    Object.keys(extract.lookupRequests).length > 0
  ) {
    let lookupRequestsState = {}
    Object.keys(extract.lookupRequests).forEach(prop => {
      const lookupValue = extractValueFromObject(
        allData.lookupRequests,
        extract.lookupRequests[prop]
      )
      lookupRequestsState[prop] = lookupValue
    })
    updatedState.lookupRequests = lookupRequestsState
  }

  return updatedState
}

const updateEndpointState = async (ctx, metaData) => {
  if (!metaData || Object.keys(metaData).length === 0) {
    throw new Error('No metaData supplied for updating state for this endpoint')
  }

  if (!metaData.state || Object.keys(metaData).length === 0) {
    return logger.info(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No state configuration for this endpoint`
    )
  }

  const updatedState = extractStateValues(ctx, metaData.state.extract)

  console.log(updatedState)

  // send update to mongo
}

const {constructOpenhimResponse} = require('../openhim')
const {endpointCache} = require('../db/services/endpoints/cache')

const getEndpointByPath = urlPath => {
  for (let endpoint of endpointCache) {
    if (endpoint.endpoint.pattern === urlPath) {
      return endpoint
    }
  }
  return null
}

exports.initiateContextMiddleware = () => async (ctx, next) => {
  const endpointStart = DateTime.utc().toISO() // set the initial start time for entry into the endpoint
  const requestUUID = uuid.v4()

  const endpoint = getEndpointByPath(ctx.url)
  if (!endpoint) {
    logger.error(`Unknown Endpoint: ${ctx.url}`)

    if (ctx.request.header && ctx.request.header['x-openhim-transactionid']) {
      ctx.response.type = 'application/json+openhim'
      ctx.status = 404
      ctx.response.body = `Unknown Endpoint: ${ctx.url}`
      constructOpenhimResponse(ctx, Date.now())
    }
    return
  }

  logger.info(`${endpoint.name} (${requestUUID}): Initiating new request`)

  // initiate the property for containing all useable data points
  ctx.state.allData = {
    constants,
    state: endpoint.state.data,
    timestamps: {
      endpointStart,
      endpointEnd: null,
      lookupRequests: {}
    }
  }

  // set request UUID from incoming OpenHIM header if present, else create a random UUID
  ctx.state.uuid = ctx.headers['x-openhim-transactionid']
    ? ctx.headers['x-openhim-transactionid']
    : requestUUID
  ctx.state.metaData = endpoint

  await next()

  try {
    // update any specified state for this endpoint request
    updateEndpointState(ctx, metaData)
  } catch (error) {
    logger.error(error)
    // do something else??
  }
}

if (process.env.NODE_ENV === 'test') {
  exports.updateEndpointState = updateEndpointState
}
