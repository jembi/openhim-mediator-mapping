'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const {createOrchestration} = require('../orchestrations')

const createMappedObject = ctx => {
  if (!ctx.state.metaData.inputMapping) {
    // Ensure input mapping is an object
    ctx.state.metaData.inputMapping = {}
    logger.warn(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
  }

  const dataToBeMapped = {
    requestBody: ctx.request.body,
    lookupRequests: ctx.lookupRequests,
    constants: ctx.state.metaData.constants
  }

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
    throw error
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

exports.mapBodyMiddleware = () => async (ctx, next) => {
  createMappedObject(ctx)
  await next()
}
