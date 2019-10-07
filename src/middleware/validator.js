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
      ctx.resourceName,
      inputValidation
    )
    const file = fs.readFileSync(resourcePath)
    validations = JSON.parse(file)
  } catch (error) {
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
          break
      }
    })

    if (schemaObject) {
      return Joi.object(schemaObject)
    }

    ctx.error = 'Joi validation schema creation failed'
    return null
  }

  return null
}

const validateInput = (ctx, joiSchema) => {
  const {error, result} = joiSchema.validate(ctx.input)

  if (error) {
    logger.warn()
    ctx.isInputValid = false
    ctx.status = 400
    ctx.body = error
  } else {
    ctx.isInputValid = true
    ctx.input = result
  }
}

exports.validationMiddleware = async (ctx, next) => {
  if (ctx && ctx.resourceName) {
    const joiSchema = createJoiValidationSchema(ctx)

    if (joiSchema) {
      validateInput(ctx, joiSchema)
    }
  } else {
    ctx.error = 'Input resource name not given'
  }
  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createJoiValidationSchema = createJoiValidationSchema
  exports.validateInput = validateInput
}
