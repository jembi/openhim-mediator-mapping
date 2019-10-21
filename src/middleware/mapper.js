'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const createMappedObject = (ctx, mappingSchema, inputConstants) => {
  if (!mappingSchema) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No mapping schema supplied`
    )
  }

  const output = {}

  try {
    if (inputConstants && mappingSchema.constants) {
      Object.assign(
        output,
        objectMapper(inputConstants, mappingSchema.constants)
      )
    }

    Object.assign(output, objectMapper(ctx.request.body, mappingSchema.input))
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
