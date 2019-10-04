const tape = require('tape')
const Joi = require('@hapi/joi')
const { createJoiValidationSchema, validateInput } = require('../../middleware/validation')

tape.test('Validation Middleware', t => {
  t.test('createJoiValidationSchema()' , t => {
    t.test('should return null when resource name is not supported', t => {
      const result = createJoiValidationSchema('unsupported')
      t.equal(result, null)
      t.end()
    })
  
    t.test('should return a schema object', t => {
      const result = createJoiValidationSchema('bahmniPatient')
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

    t.test('should update ctx properties\' status and isInputValid when validation fails', t => {
      const ctx = {
        input: {
          name: 'tyler',
          surname: 'durden'
        }
      }

      validateInput(ctx, joiSchema)

      t.equal(ctx.status, 400)
      t.equal(ctx.isInputValid, false)
      t.notEqual(ctx.body.toString().match(/"age" is required/).length, 0)
      t.end()
    })

    t.test('should update ctx response body when validation fails', t => {
      const ctx = {
        input: {
          surname: 'durden',
          age: 33
        }
      }

      validateInput(ctx, joiSchema)

      t.notEqual(ctx.body.toString().match(/"name" is required/).length, 0)
      t.end()
    })

    t.test('should update the isInputValid property to true when validation succeeds', t => {
      const ctx = {
        input: {
          name: 'tyler',
          surname: 'durden',
          age: 21
        }
      }

      validateInput(ctx, joiSchema)

      t.equal(ctx.isInputValid, true)
      t.end()
    })
  })
})
