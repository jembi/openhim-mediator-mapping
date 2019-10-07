'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('../logger')

const validateInput = validationSchema => async (ctx, next) => {
  ctx.validation = validationSchema

  await next()

  logger.debug(`Mapping Schema: ${JSON.stringify(ctx.mapping)}`)
}

exports.validateInput = validateInput
