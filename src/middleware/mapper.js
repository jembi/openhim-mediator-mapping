'use strict'

const objectMapper = require('object-mapper')

const logger = require('../logger')

const transformInput = mappingSchema => ctx => {
  logger.debug(`Validation Schema: ${JSON.stringify(ctx.validation)}`)

  ctx.body = objectMapper(ctx.request.body, mappingSchema)
  ctx.status = 200
  ctx.mapping = mappingSchema
}

exports.transformInput = transformInput
