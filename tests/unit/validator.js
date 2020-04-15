'use strict'

const rewire = require('rewire')
const tap = require('tap')

const validator = rewire('../../src/middleware/validator')
const performValidation = validator.__get__('performValidation')

tap.test('Validation Middleware', {autoend: true}, t => {
  t.test('performValidation()', {autoend: true}, t => {
    t.test('should allow no validation schema', t => {
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
            name: 'Testing endpoint',
            inputValidation: null
          }
        }
      }

      try {
        performValidation(ctx)
      } catch (e) {
        t.error('Should not reach here')
      }

      t.end()
    })

    t.test('should throw when request body is not supplied', t => {
      const ctx = {
        request: {},
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint',
            inputValidation: {}
          }
        }
      }

      t.throws(() => performValidation(ctx), /No data to validate/)
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
            name: 'Testing endpoint',
            inputValidation: {
              type: 'object',
              properties: {
                requestBody: {
                  type: 'object',
                  properties: {
                    name: {type: 'string'},
                    surname: {type: 'string'}
                  },
                  required: ['name']
                }
              }
            }
          }
        }
      }

      t.throws(() => performValidation(ctx), /Validation failed/)
      t.end()
    })

    t.test('should validate', t => {
      const ctx = {
        request: {
          body: {
            name: 'drake',
            surname: 'durden'
          }
        },
        state: {
          metaData: {
            type: 'object',
            properties: {
              requestBody: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  surname: {type: 'string'}
                },
                required: ['name']
              }
            }
          }
        }
      }

      t.doesNotThrow(() => performValidation(ctx))
      t.end()
    })

    t.test('should validate when a property has a value of null', t => {
      // // clear the module with the out-dated config
      delete require.cache[require.resolve('rewire')]
      // // set environment variable to allow null values
      process.env.VALIDATION_ACCEPT_NULL_VALUES = 'true'
      // // require module to get updated config
      const rewire = require('rewire')
      const validator = rewire('../../src/middleware/validator')
      const performValidation = validator.__get__('performValidation')

      const ctx = {
        request: {
          body: {
            name: 'drake',
            surname: null
          }
        },
        state: {
          metaData: {
            name: '',
            inputValidation: {
              type: 'object',
              properties: {
                requestBody: {
                  type: 'object',
                  properties: {
                    name: {type: 'string'},
                    surname: {type: 'string', nullable: true}
                  },
                  required: ['name']
                }
              }
            }
          }
        }
      }

      t.doesNotThrow(() => performValidation(ctx))
      t.end()
    })
  })
})
