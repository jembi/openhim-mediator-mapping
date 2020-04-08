'use strict'

const uuid = require('uuid')

const logger = require('../logger')
const {extractValueFromObject} = require('../util')

const extractStateValues = (ctx, extract) => {
  if (
    !extract ||
    !extract.system ||
    !extract.requestBody ||
    !extract.responseBody ||
    !extract.query
  ) {
    throw new Error('No state extract definitions supplied for this endpoint')
  }

  const allData = ctx.state.allData
  let updatedState = {}

  if (extract.system) {
    // TODO
  }

  if (extract.requestBody) {
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

  if (extract.responseBody) {
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

  if (extract.query) {
    // TODO
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

  // function to set specified state values

  // send update to mongo
}

exports.initiateContextMiddleware = (metaData, constants) => async (
  ctx,
  next
) => {
  // set request UUID from incoming OpenHIM header if present, else create a random UUID
  ctx.state.uuid = ctx.headers['x-openhim-transactionid']
    ? ctx.headers['x-openhim-transactionid']
    : uuid.v4()
  ctx.state.metaData = metaData

  // initiate the property for containing all useable data points
  ctx.state.allData = {
    constants,
    state: metaData.state.data
  }

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Initiating new request`
  )
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
