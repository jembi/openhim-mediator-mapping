'use strict'

const Ajv = require('ajv')
const logger = require('../logger')
const config = require('../config')

const configurations = config.getConfig()

const performValidation = (ctx, schema) => {
  if (!schema) {
    throw new Error(`No validation rules supplied`)
  }

  if (!ctx || !ctx.request || !ctx.request.body) {
    throw new Error(`Invalid request body`)
  }

  const coerceTypes =
    configurations.validation.coerceTypes === 'false'
      ? false
      : configurations.validation.coerceTypes

  const ajv = new Ajv({
    nullable: configurations.validation.nullable,
    coerceTypes: coerceTypes
  })

  const valid = ajv.validate(schema, ctx.request.body)

  if (!valid) {
    throw new Error(`Validation failed: ${ajv.errorsText()}`)
  }
}

exports.validateInput = schema => async (ctx, next) => {
  performValidation(ctx, schema)
  logger.info('Successfully validated user input')
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.performValidation = performValidation
}
