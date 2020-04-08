'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const {createOrchestration} = require('../orchestrations')

const createMappedObject = (ctx, mappingSchema, inputConstants) => {
  if (!mappingSchema) {
    mappingSchema = {}
    logger.warn(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
  }

  const dataToBeMapped = {
    requestBody: ctx.request.body,
    lookupRequests: ctx.lookupRequests,
    constants: inputConstants
  }

  const output = {}
  const mappingStartTimestamp = new Date()

  try {
    Object.assign(output, objectMapper(dataToBeMapped, mappingSchema))
  } catch (error) {
    throw Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Object mapping failed: ${error.message}`
    )
  }

  ctx.body = output
  ctx.status = 200

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully mapped output document`
  )

  if (ctx.request.header && ctx.request.header['x-openhim-transactionid']) {
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

exports.mapBodyMiddleware = (mappingSchema, inputConstants) => async (
  ctx,
  next
) => {
  createMappedObject(ctx, mappingSchema, inputConstants)
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createMappedObject = createMappedObject
}
