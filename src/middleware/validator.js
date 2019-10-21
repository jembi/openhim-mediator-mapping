'use strict'

const Ajv = require('ajv')

const logger = require('../logger')
const config = require('../config').getConfig()

const performValidation = (ctx, schema) => {
  if (!schema) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No validation rules supplied`
    )
  }

  if (!ctx || !ctx.request || !ctx.request.body) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Invalid request body`
    )
  }

  const ajv = new Ajv({
    nullable: config.validation.nullable,
    coerceTypes: config.validation.coerceTypes
  })

  const valid = ajv.validate(schema, ctx.request.body)

  if (!valid) {
    throw new Error(
      `${ctx.state.metaData.name} (${
        ctx.state.uuid
      }): Validation failed: ${ajv.errorsText()}`
    )
  }
}

exports.validateBodyMiddleware = schema => async (ctx, next) => {
  performValidation(ctx, schema)
  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully validated user input`
  )
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.performValidation = performValidation
}
