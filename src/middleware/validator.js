'use strict'

const fs = require('fs')
const path = require('path')
const Joi = require('@hapi/joi')

const logger = require('../logger')
const {inputValidation} = require('../constants')

/*
  This method creates a joi validation schema.
  It returns null if the schema creation fails and updates the context with an error
*/
const createJoiValidationSchema = ctx => {
  let validations
  const schemaObject = {}

  try {
    const resourcePath = path.resolve(
      __dirname,
      '..',
      '..',
      'endpoints',
      ctx.directory,
      inputValidation
    )
    const file = fs.readFileSync(resourcePath)
    validations = JSON.parse(file)
  } catch (error) {
    logger.error(`Failed to get validation schema from file: ${error.message}`)
    ctx.error = error
    return null
  }

  if (validations) {
    Object.keys(validations).forEach(key => {
      let rule = validations[`${key}`]
      switch (rule.type) {
        case 'string':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.string().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.string().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.string()
          }
          break

        case 'number':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.number().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.number().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.number()
          }
          break

        case 'boolean':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.boolean().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.boolean().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.boolean()
          }
          break

        case 'array':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.array().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.array().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.array()
          }
          break

        default:
          logger.warn(`No matching validation for rule type: ${rule.type}`)
          break
      }
    })

    if (schemaObject) {
      return Joi.object(schemaObject)
    }

    ctx.error = 'Joi validation schema creation failed'
    return null
  }
  logger.warn('No validation schema in file')
  return null
}

const validateInput = (ctx, joiSchema) => {
  const {error, value} = joiSchema.validate(ctx.request.body)

  if (error) {
    ctx.status = 400
    ctx.body = error
  } else {
    logger.debug('Successfully validated user input')
    ctx.input = value
  }
}

exports.validationMiddleware = (directory) => async (ctx, next) => {
  if (directory) {
    ctx.directory = directory
    const joiSchema = createJoiValidationSchema(ctx)

    validateInput(ctx, joiSchema)
    if (!ctx.input) {
      logger.error(`Validation Failed: ${ctx.body.message}`)
      return new Error(`Validation Failed: ${ctx.body}`)
    }
  } else {
    logger.error('No input resource name provided')
    ctx.error = 'Input resource name not given'
  }
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createJoiValidationSchema = createJoiValidationSchema
  exports.validateInput = validateInput
}
