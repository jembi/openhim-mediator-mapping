'use strict'

const rewire = require('rewire')
const tap = require('tap')
const {validateBodyMiddleware} = require('../../src/middleware/validator')

const validator = rewire('../../src/middleware/validator')
const performValidation = validator.__get__('performValidation')

tap.test('Validation Middleware', {autoend: true}, t => {
  t.test('performValidation()', {autoend: true}, t => {
    t.test('should allow no validation schema', t => {
      const ctx = {
        request: {
          body: {
            name: 'Tyler',
            surname: 'Durden'
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

    t.test(
      'should throw when both request.body and lookupRequests are not supplied',
      t => {
        const ctx = {
          request: {},
          lookupRequests: null,
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
      }
    )

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

    t.test('should validate lookupRequests data', t => {
      const ctx = {
        request: {},
        lookupRequests: {
          name: 'Typer',
          surname: 'Durden'
        },
        state: {
          metaData: {
            inputValidation: {
              type: 'object',
              properties: {
                lookupRequests: {
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

      t.doesNotThrow(() => performValidation(ctx))
      t.end()
    })

    t.test('should validate', t => {
      t.plan(2)

      const ctx = {
        request: {
          body: {
            name: 'Drake',
            surname: 'Durden'
          }
        },
        state: {
          metaData: {
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

      t.doesNotThrow(() =>
        validateBodyMiddleware()(ctx, () => {
          t.pass()
        })
      )
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
            name: 'Drake',
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
