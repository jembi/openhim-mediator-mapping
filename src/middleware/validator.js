'use strict'

const Ajv = require('ajv')

const config = require('../config').getConfig()
const logger = require('../logger')

const ajv = new Ajv({
  nullable: config.validation.nullable,
  coerceTypes: config.validation.coerceTypes,
  allErrors: true,
  jsonPointers: true
})

// Ajv options allErrors and jsonPointers are required
require('ajv-errors')(ajv /*, {singleError: true} */)

const performValidation = ctx => {
  if (!ctx.state.metaData.inputValidation) {
    logger.warn(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No validation rules supplied`
    )
    return
  }

  const dataToValidate = {}

  if (ctx && ctx.request && ctx.request.body) {
    dataToValidate.requestBody = ctx.request.body
  }

  if (ctx.lookupRequests) {
    dataToValidate.lookupRequests = ctx.lookupRequests
  }

  if (!dataToValidate.requestBody && !dataToValidate.lookupRequests) {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No data to validate`
    )
  }

  const valid = ajv.validate(ctx.state.metaData.inputValidation, dataToValidate)

  if (!valid) {
    throw new Error(
      `${ctx.state.metaData.name} (${
        ctx.state.uuid
      }): Validation failed: ${ajv.errorsText()}`
    )
  }

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully validated user input`
  )
}

exports.validateBodyMiddleware = () => async (ctx, next) => {
  performValidation(ctx)
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.performValidation = performValidation
}
