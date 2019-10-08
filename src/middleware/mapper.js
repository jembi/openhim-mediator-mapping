'use strict'

const fs = require('fs')
const path = require('path')
const objectMapper = require('object-mapper')

const logger = require('../logger')
const {inputMapping, output} = require('../constants')

const transformInput = ctx => {
  logger.debug(`Validation Schema: ${JSON.stringify(ctx.input)}`)

  const mappingFile = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'endpoints', ctx.directory, inputMapping)
  )
  const mappingSchema = JSON.parse(mappingFile)

  const outputFilePath = path.resolve(__dirname, '..', '..', 'endpoints', ctx.directory, output)
  let outputJson = null
  if (fs.existsSync(outputFilePath)) {
    const outputFile = fs.readFileSync(
      outputFilePath
    )
    outputJson = JSON.parse(outputFile)
  }

  ctx.body = objectMapper(ctx.input, outputJson, mappingSchema)
  ctx.status = 200
  ctx.mapping = mappingSchema
}

exports.transformInput = transformInput
