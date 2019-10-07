'use strict'

const tape = require('tape')
const Joi = require('@hapi/joi')
const {
  createValidationSchema,
  validateInput
} = require('../../src/middleware/validator')

tape.test('Validation Middleware', t => {
  t.test('createValidationSchema()', t => {
    t.test('should return null when resource name is not supported', t => {
      const ctx = {
        directory: 'unsupported'
      }

      const result = createValidationSchema(ctx)

      t.equal(result, null)
      t.end()
    })

    t.test('should return a schema object', t => {
      const ctx = {
        directory: 'bahmni'
      }

      const result = createValidationSchema(ctx)
      t.notEqual(result, null)
      t.end()
    })
  })

  t.test('validateInput()', t => {
    const joiSchema = Joi.object({
      name: Joi.string().required(),
      surname: Joi.string(),
      age: Joi.number().required()
    })

    t.test('should update ctx status when validation fails', t => {
      const ctx = {
        request: {
          body: {
            name: 'tyler',
            surname: 'durden'
          }
        }
      }

      validateInput(ctx, joiSchema)

      t.equal(ctx.status, 400)
      t.notEqual(ctx.body.toString().match(/"age" is required/).length, 0)
      t.end()
    })

    t.test('should update ctx response body when validation fails', t => {
      const ctx = {
        request: {
          body: {
            surname: 'durden',
            age: 33
          }
        }
      }

      validateInput(ctx, joiSchema)

      t.notEqual(ctx.body.toString().match(/"name" is required/).length, 0)
      t.end()
    })

    t.test('should set the ctx input property when validation succeeds', t => {
      const ctx = {
        request: {
          body: {
            name: 'tyler',
            surname: 'durden',
            age: 21
          }
        }
      }

      validateInput(ctx, joiSchema)

      t.notEqual(ctx.input, undefined)
      t.end()
    })
  })
})
