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
          },
          allData: {
            state: {},
            timestamps: {
              lookupRequests: {}
            }
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
      'should throw when no request.body, query params, or lookupRequests are supplied',
      t => {
        const ctx = {
          request: {},
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              inputValidation: {}
            },
            allData: {
              lookupRequests: null
            }
          }
        }

        t.throws(() => performValidation(ctx), /No data to validate/)
        t.end()
      }
    )

    t.test('should throw when request body is not valid', t => {
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
          },
          allData: {
            state: {},
            timestamps: {
              lookupRequests: {}
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
          },
          allData: {
            lookupRequests: {
              name: 'Typer',
              surname: 'Durden'
            }
          }
        }
      }

      t.doesNotThrow(() => performValidation(ctx))
      t.end()
    })

    t.test('should validate requestBody data', t => {
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
          },
          allData: {
            lookupRequests: {}
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

    t.test('should validate requestBody data', t => {
      t.plan(2)

      const ctx = {
        request: {
          query: {
            id: 'test',
            paging: 'false'
          }
        },
        state: {
          metaData: {
            name: 'Testing endpoint',
            inputValidation: {
              type: 'object',
              properties: {
                query: {
                  type: 'object',
                  properties: {
                    id: {type: 'string'},
                    paging: {type: 'string'}
                  },
                  required: ['id', 'paging']
                }
              }
            }
          },
          allData: {
            lookupRequests: {}
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
      // clear the module with the out-dated config
      delete require.cache[require.resolve('rewire')]
      // set environment variable to allow null values
      process.env.VALIDATION_ACCEPT_NULL_VALUES = 'true'
      // require module to get updated config
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
          },
          allData: {
            lookupRequests: {}
          }
        }
      }

      t.doesNotThrow(() => performValidation(ctx))
      t.end()
    })
  })
})
