'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('../logger')
const {inputValidation} = require('../constants')

const validateInput = directory => async (ctx, next) => {
  const validationFile = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'endpoints', directory, inputValidation)
  )

  const validationSchema = JSON.parse(validationFile)
  ctx.validation = validationSchema

  await next()

  logger.debug(`Mapping Schema: ${JSON.stringify(ctx.mapping)}`)
}

exports.validateInput = validateInput
