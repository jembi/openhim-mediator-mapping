'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const createMappedObject = (ctx, mappingSchema, inputConstants) => {
  if (!mappingSchema) {
    throw new Error(`No mapping schema supplied`)
  }

  const output = {}

  if (inputConstants && mappingSchema.constants) {
    Object.assign(output, objectMapper(inputConstants, mappingSchema.constants))
  }

  Object.assign(output, objectMapper(ctx.request.body, mappingSchema.input))

  ctx.body = output
  ctx.status = 200
}

exports.transformInput = (mappingSchema, inputConstants) => async (
  ctx,
  next
) => {
  try {
    createMappedObject(ctx, mappingSchema, inputConstants)
  } catch (error) {
    ctx.status = 400
    ctx.type = 'json'
    ctx.body = JSON.stringify({
      error: `Transformation Failed: ${error.message}`
    })
    return logger.error(`Transformation Failed: ${error.message}`)
  }
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createMappedObject = createMappedObject
}
