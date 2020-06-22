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

  if (ctx.request && ctx.request.body) {
    dataToValidate.requestBody = ctx.request.body
  }

  if (
    ctx.request &&
    ctx.request.query &&
    Object.keys(ctx.request.query).length
  ) {
    dataToValidate.query = ctx.request.query
  }

  if (ctx.state.allData.lookupRequests) {
    dataToValidate.lookupRequests = ctx.state.allData.lookupRequests
  }

  if (
    !dataToValidate.requestBody &&
    !dataToValidate.lookupRequests &&
    !dataToValidate.query
  ) {
    logger.error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Validation Rules supplied but no data received to validate`
    )
    throw new Error(`No data to validate`)
  }

  const valid = ajv.validate(ctx.state.metaData.inputValidation, dataToValidate)

  if (!valid) {
    throw new Error(`Validation failed: ${ajv.errorsText()}`)
  }

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully validated user input`
  )
}

exports.validateBodyMiddleware = () => async (ctx, next) => {
  performValidation(ctx)
  await next()
}
