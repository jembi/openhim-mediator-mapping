'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')
const {OPENHIM_TRANSACTION_HEADER} = require('../constants')
const {createOrchestration} = require('../orchestrations')

const createMappedObject = ctx => {
  if (
    !ctx.state.metaData.inputMapping ||
    !Object.keys(ctx.state.metaData.inputMapping).length
  ) {
    logger.warn(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
    ctx.body = ctx.state.allData.lookupRequests
      ? {
          requestBody: ctx.state.allData.requestBody,
          lookupRequests: ctx.state.allData.lookupRequests
        }
      : ctx.state.allData.requestBody
    return
  }

  const dataToBeMapped = ctx.state.allData

  const output = {}
  const mappingStartTimestamp = new Date()

  try {
    Object.assign(
      output,
      objectMapper(dataToBeMapped, ctx.state.metaData.inputMapping)
    )
  } catch (error) {
    logger.error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Object mapping failed: ${error.message}`
    )
    // Set the status code which will used to set the response status
    ctx.statusCode = 500
    throw Error(`Object mapping schema invalid: ${error.message}`)
  }

  // set the outgoing payload as useable data point
  ctx.state.allData.responseBody = output

  ctx.body = output
  ctx.status = 200

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully mapped output document`
  )

  if (ctx.request.header && ctx.request.header[OPENHIM_TRANSACTION_HEADER]) {
    const orchestrationName = 'Mapping'
    const mappingEndTimestamp = new Date()
    const response = {
      body: output
    }
    const request = {}
    const error = null

    if (!ctx.orchestrations) {
      ctx.orchestrations = []
    }

    const orchestration = createOrchestration(
      request,
      dataToBeMapped,
      response,
      mappingStartTimestamp,
      mappingEndTimestamp,
      orchestrationName,
      error
    )

    ctx.orchestrations.push(orchestration)
  }
}

exports.mapBodyMiddleware = () => async (ctx, next) => {
  createMappedObject(ctx)
  await next()
}
