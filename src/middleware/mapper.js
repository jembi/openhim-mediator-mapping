'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const createMappedObject = (ctx, mappingSchema) => {
  if (!mappingSchema) {
    throw new Error(`No mapping schema supplied`)
  }

  ctx.body = objectMapper(ctx.request.body, mappingSchema)
  ctx.status = 200
}


exports.transformInput = mappingSchema => async (ctx, next) => {
  try {
    createMappedObject(ctx, mappingSchema)
    await next()
  } catch (error) {
    ctx.error = error
    return logger.error(`Transformation Failed: ${ctx.body.message}`)
  }
}


if (process.env.NODE_ENV == 'test') {
  exports.createMappedObject = createMappedObject
}
