'use strict'

const tape = require('tape')
const Joi = require('@hapi/joi')
const {
  createValidationSchema,
  performValidation
} = require('../../src/middleware/validator')

tape.test('Validation Middleware', t => {
  t.test('createValidationSchema()', t => {
    t.test('should throw when resource is not supplied', t => {
      t.throws(createValidationSchema, /No validation rules supplied/)
      t.end()
    })

    t.test('should return a schema object', t => {
      const validationMap = {
        '@type': 'object',
        name: {
          '@type': 'string',
          required: true
        },
        surname: {
          '@type': 'string'
        }
      }

      const invalidInput = {
        surname: 'Wick'
      }

      const validInput = {
        name: 'Peter',
        surname: 'Grifin'
      }

      const schema = createValidationSchema(validationMap)
      const validationOne = schema.validate(invalidInput)
      const validationTwo = schema.validate(validInput)

      t.notEqual(validationOne.error.toString().match(/name is required/))
      t.equal(validationTwo.error, undefined)
      t.end()
    })
  })

  t.test('performValidation()', t => {
    const joiSchema = Joi.object({
      name: Joi.string().required(),
      surname: Joi.string(),
      age: Joi.number().required()
    })

    t.test('should throw for missing required number fields', t => {
      const ctx = {
        request: {
          body: {
            name: 'tyler',
            surname: 'durden'
          }
        }
      }

      t.throws(
        () => performValidation(ctx, joiSchema),
        `Validation execution failed: "age" is required`
      )
      t.end()
    })

    t.test('should throw for missing required string fields', t => {
      const ctx = {
        request: {
          body: {
            surname: 'durden',
            age: 33
          }
        }
      }

      t.throws(
        () => performValidation(ctx, joiSchema),
        `Validation execution failed: "name" is required`
      )
      t.end()
    })

    t.test('should not throw when validation succeeds', t => {
      const ctx = {
        request: {
          body: {
            name: 'tyler',
            surname: 'durden',
            age: 21
          }
        }
      }

      performValidation(ctx, joiSchema)

      t.end()
    })
  })
})
