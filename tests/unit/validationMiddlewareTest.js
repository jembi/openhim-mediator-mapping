'use strict'

const tape = require('tape')
const {performValidation} = require('../../src/middleware/validator')

tape.test('Validation Middleware', t => {
  t.test('performValidation()', t => {
    t.test('should throw when validation schema is falsy', t => {
      const ctx = {
        request: {
          body: {
            name: 'tyler',
            surname: 'durden'
          }
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }
      const schema = null

      t.throws(
        () => performValidation(ctx, schema),
        /No validation rules supplied/
      )
      t.end()
    })

    t.test('should throw when request body is not supplied', t => {
      const ctx = {
        request: {},
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }
      const schema = {}

      t.throws(() => performValidation(ctx, schema), /Invalid request body/)
      t.end()
    })

    t.test('should throw when request is body not valid', t => {
      const ctx = {
        request: {
          body: {
            surname: 'durden'
          }
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          name: {type: 'string'},
          surname: {type: 'string'}
        },
        required: ['name']
      }

      t.throws(() => performValidation(ctx, schema), /Validation failed/)
      t.end()
    })

    t.test('should validate', t => {
      const ctx = {
        request: {
          body: {
            name: 'drake',
            surname: 'durden'
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          name: {type: 'string'},
          surname: {type: 'string'}
        },
        required: ['name']
      }

      t.doesNotThrow(() => performValidation(ctx, schema))
      t.end()
    })

    t.test('should validate when a property has a value of null', t => {
      // clear the module with the out-dated config
      delete require.cache[require.resolve('../../src/middleware/validator')]
      // set environment variable to allow null values
      process.env.VALIDATION_ACCEPT_NULL_VALUES = 'true'
      // require module to get updated config
      const validatorUpdatedEnv = require('../../src/middleware/validator')

      const ctx = {
        request: {
          body: {
            name: 'drake',
            surname: null
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          name: {type: 'string'},
          surname: {type: 'string', nullable: true}
        },
        required: ['name']
      }

      t.doesNotThrow(() => validatorUpdatedEnv.performValidation(ctx, schema))
      t.end()
    })
  })
})
