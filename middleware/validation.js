'use strict'

const Joi = require('@hapi/joi')
const bahmniInputValidations = require('../endpoints/bahmni/input-validation.json')
const openIMISInputValidations = require('../endpoints/openIMIS/input-validation.json')

// This method creates a joi vaidation schema. It returns null if the scheam creation fails
const createJoiValidationSchema = (resourceName) => {
  let validations
  const schemaObject = {}

  // TODO add more cases for other resources
  switch (resourceName) {
    case 'bahmniPatient':
      validations = bahmniInputValidations
      break

    case 'openIMIS':
      validations = openIMISInputValidations
      break

    default:
      break;
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
          break;
        
        case 'number':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.number().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.number().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.number()
          } 
          break;
        
        case 'boolean':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.boolean().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.boolean().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.boolean()
          }
          break;
        
        case 'array':
          if (rule.required) {
            schemaObject[`${key}`] = Joi.array().required()
          } else if (rule.default) {
            schemaObject[`${key}`] = Joi.array().default(rule.default)
          } else {
            schemaObject[`${key}`] = Joi.array()
          }
          break;

        default:

          break;
      }
    })

    if (schemaObject) return Joi.object(schemaObject)
    return null
  }

  return null
}

if (process.env.NODE_ENV == "test") {
  exports.createJoiValidationSchema = createJoiValidationSchema
}
