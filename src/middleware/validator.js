'use strict'

const Ajv = require('ajv')
const logger = require('../logger')
const config = require('../config').getConfig()

const performValidation = (ctx, schema) => {
  if (!schema) {
    throw new Error(`No validation rules supplied`)
  }

  if (!ctx || !ctx.request || !ctx.request.body) {
    throw new Error(`Invalid request body`)
  }

  const coerceTypes =
    config.validation.coerceTypes === 'false'
      ? false
      : config.validation.coerceTypes

  const ajv = new Ajv({
    nullable: config.validation.nullable,
    coerceTypes: coerceTypes
  })

  const valid = ajv.validate(schema, ctx.request.body)

  if (!valid) {
    throw new Error(`Validation failed: ${ajv.errorsText()}`)
  }
}

exports.validateBodyMiddleware = schema => async (ctx, next) => {
  try {
    performValidation(ctx, schema)
    logger.info('Successfully validated user input')
  } catch (error) {
    ctx.status = 400
    ctx.type = 'json'
    ctx.body = {
      error: error.message
    }
    return logger.error(error.message)
  }

  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.performValidation = performValidation
}
