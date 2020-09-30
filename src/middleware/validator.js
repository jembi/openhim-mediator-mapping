'use strict'

const Ajv = require('ajv')

const config = require('../config').getConfig()
const logger = require('../logger')
const {OPENHIM_TRANSACTION_HEADER} = require('../constants')
const {createOrchestration} = require('../orchestrations')

const ajv = new Ajv({
  nullable: config.validation.nullable,
  coerceTypes: config.validation.coerceTypes,
  allErrors: true,
  jsonPointers: true
})

// Ajv options allErrors and jsonPointers are required
require('ajv-errors')(ajv /*, {singleError: true} */)

const performValidation = ctx => {
  const validationStartTimestamp = new Date()

  if (
    !ctx.state.metaData.inputValidation ||
    !Object.keys(ctx.state.metaData.inputValidation).length
  ) {
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

  if (ctx.request.headers && ctx.request.headers[OPENHIM_TRANSACTION_HEADER]) {
    const orchestrationName = `Endpoint Validation: ${ctx.state.metaData.name}`
    const validationEndTimestamp = new Date()
    const response = {
      body: valid
    }
    const error = null

    if (!ctx.orchestrations) {
      ctx.orchestrations = []
    }

    const orchestration = createOrchestration(
      {data: dataToValidate},
      response,
      validationStartTimestamp,
      validationEndTimestamp,
      orchestrationName,
      error
    )

    ctx.orchestrations.push(orchestration)
  }
}

exports.validateBodyMiddleware = () => async (ctx, next) => {
  performValidation(ctx)
  await next()
}
