'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const createMappedObject = (ctx, mappingSchema, inputConstants) => {
  if (!mappingSchema) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
  }

  const dataToBeMapped = {
    requestBody: ctx.request.body,
    lookupRequests: ctx.lookupRequests,
    constants: inputConstants
  }

  const output = {}

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
