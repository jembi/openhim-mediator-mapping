'use strict'

const tap = require('tap')

const {performValidation} = require('../../src/middleware/validator')

tap.test('Validation Middleware', {autoend: true}, t => {
  t.test('performValidation()', {autoend: true}, t => {
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
<<<<<<< HEAD:tests/unit/validationMiddlewareTest.js
            name: 'Testing endpoint'
          },
          allData: {
            state: {},
            timestamps: {
              lookupRequests: {}
            }
=======
            name: 'Testing endpoint',
            inputValidation: null
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/validationMiddleware.js
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
<<<<<<< HEAD:tests/unit/validationMiddlewareTest.js
            name: 'Testing endpoint'
          },
          allData: {
            state: {},
            timestamps: {
              lookupRequests: {}
            }
=======
            name: 'Testing endpoint',
            inputValidation: {}
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/validationMiddleware.js
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
<<<<<<< HEAD:tests/unit/validationMiddlewareTest.js
            name: 'Testing endpoint'
          },
          allData: {
            state: {},
            timestamps: {
              lookupRequests: {}
            }
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          requestBody: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              surname: {type: 'string'}
            },
            required: ['name']
=======
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
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/validationMiddleware.js
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
<<<<<<< HEAD:tests/unit/validationMiddlewareTest.js
          allData: {
            lookupRequests: {}
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          requestBody: {
=======
          metaData: {
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/validationMiddleware.js
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
        },
        state: {
<<<<<<< HEAD:tests/unit/validationMiddlewareTest.js
          allData: {
            lookupRequests: {}
          }
        }
      }
      const schema = {
        type: 'object',
        properties: {
          requestBody: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              surname: {type: 'string', nullable: true}
            },
            required: ['name']
=======
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
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/validationMiddleware.js
          }
        }
      }

      t.doesNotThrow(() => validatorUpdatedEnv.performValidation(ctx))
      t.end()
    })
  })
})
