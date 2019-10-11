'use strict'

const fs = require('fs')
const path = require('path')
const Joi = require('@hapi/joi')
const builder = require('joi-json').builder(Joi)

const logger = require('../logger')

const createValidationSchema = validationMap => {
  if (!validationMap) {
    throw new Error('No validation rules supplied')
  }

  const schema = Joi.object(builder.build(validationMap))

  if (!schema) {
    throw new Error('Joi validation schema creation failed')
  }
  return schema
}

const performValidation = (ctx, schema) => {
  const {error} = schema.validate(ctx.request.body)

  if (error) {
    throw new Error(`Validation execution failed: ${error.message}`)
  }
}

exports.validateInput = validationMap => async (ctx, next) => {
  let schema
  try {
    schema = createValidationSchema(validationMap)
    logger.debug('Successfully validated user input')
  } catch (error) {
    ctx.status = 400
    ctx.body = error
    return logger.error(error)
  }

  try {
    performValidation(ctx, schema)
  } catch (error) {
    ctx.status = 400
    ctx.body = error
    return logger.error(error)
  }

  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createValidationSchema = createValidationSchema
  exports.performValidation = performValidation
}
