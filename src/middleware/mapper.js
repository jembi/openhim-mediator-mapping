'use strict'

const fs = require('fs')
const path = require('path')
const objectMapper = require('object-mapper')

const logger = require('../logger')
const {inputMapping} = require('../constants')

const transformInput = ctx => {
  logger.debug(`Validation Schema: ${JSON.stringify(ctx.input)}`)

  const mappingFile = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'endpoints', ctx.directory, inputMapping)
  )
  const mappingSchema = JSON.parse(mappingFile)

  ctx.body = objectMapper(ctx.input, mappingSchema)
  ctx.status = 200
  ctx.mapping = mappingSchema
}

exports.transformInput = transformInput
