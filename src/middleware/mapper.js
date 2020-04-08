'use strict'

const objectMapper = require('object-mapper')
const {createOrchestration} = require('../orchestrations')

const logger = require('../logger')

const createMappedObject = (ctx, mappingSchema) => {
  if (!mappingSchema) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
  }

  const dataToBeMapped = ctx.state.allData

  const output = {}
  const mappingStartTimestamp = new Date()

  try {
    Object.assign(output, objectMapper(dataToBeMapped, mappingSchema))
  } catch (error) {
    throw Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Object mapping failed: ${error.message}`
    )
  }

  // set the outgoing payload as useable data point
  ctx.state.allData.responseBody = output

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
