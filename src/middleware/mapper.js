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
