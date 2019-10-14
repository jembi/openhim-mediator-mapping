'use strict'

const Joi = require('@hapi/joi')

const logger = require('../logger')

const createValidationSchema = validationMap => {
  if (!validationMap) {
    throw new Error('No validation rules supplied')
  }

  const validations = validationMap
  const schemaObject = {}

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

        case 'object':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.object().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.object().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.object()
          }
          break

        default:
          throw new Error(`Validation rule type is not supported: ${rule.type}`)
      }
    })

    if (schemaObject) {
      return Joi.object(schemaObject)
    }

    throw new Error('Joi validation schema creation failed')
  }

  throw new Error('No validation schema in file')
}

const performValidation = (ctx, schema) => {
  const {error, value} = schema.validate(ctx.request.body)

  if (error) {
    throw new Error(`Validation execution failed: ${error.message}`)
  }
}

exports.validateInput = validationMap => async (ctx, next) => {
  try {
    const schema = createValidationSchema(validationMap)
    performValidation(ctx, schema)
    logger.info('Successfully validated user input')
  } catch (error) {
    ctx.status = 400
    ctx.type = 'json'
    ctx.body = JSON.stringify({ error: error.message })
    return logger.error(error.message)
  }

  await next()
}

if (process.env.NODE_ENV == 'test') {
  exports.createValidationSchema = createValidationSchema
  exports.performValidation = performValidation
}
