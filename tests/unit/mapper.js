'use strict'

const rewire = require('rewire')
const tap = require('tap')
const sinon = require('sinon')

const mapper = rewire('../../src/middleware/mapper')
const {OPENHIM_TRANSACTION_HEADER} = require('../../src/constants')
const createMappedObject = mapper.__get__('createMappedObject')

tap.test('Mapper', {autoend: true}, t => {
  t.test('createMappedObject()', {autoend: true}, t => {
    t.test(
      'should do no mapping if mapping schema is undefined and return the object sent and lookups done',
      t => {
        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            },
            allData: {
              requestBody: {
                name: 'Timothy'
              },
              lookupRequests: {
                surname: 'Wesley'
              }
            }
          },
          request: {
            body: {}
          }
        }

        createMappedObject(ctx)

        t.deepEqual(ctx.body, {
          requestBody: ctx.state.allData.requestBody,
          lookupRequests: ctx.state.allData.lookupRequests
        })
        t.end()
      }
    )

    t.test(
      'should do no mapping if mapping schema is undefined and return the object sent',
      t => {
        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            },
            allData: {
              requestBody: {
                name: 'Timothy'
              }
            }
          },
          request: {
            body: {}
          }
        }

        createMappedObject(ctx)

        t.deepEqual(ctx.body, ctx.state.allData.requestBody)
        t.end()
      }
    )

    t.test(
      'should create an object based on mapping (from request body)',
      t => {
        const body = {
          inputOne: 1,
          inputTwo: 2,
          inputThree: 3
        }
        const ctx = {
          request: {
            body
          },
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              inputMapping: {
                'requestBody.inputOne': 'outputOne',
                'requestBody.inputTwo': 'outputTwo',
                'requestBody.inputThree': 'outputThree'
              }
            },
            allData: {
              requestBody: body
            }
          }
        }

        const expected = {
          outputOne: 1,
          outputTwo: 2,
          outputThree: 3
        }

        createMappedObject(ctx)

        t.deepEqual(ctx.body, expected)
        t.end()
      }
    )

    t.test(
      'should create an object based on mapping (from request body, lookup requests and constants) ',
      t => {
        const body = {
          inputZero: 0
        }
        const ctx = {
          request: {
            body
          },
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              inputMapping: {
                'requestBody.inputZero': 'outputZero',
                'lookupRequests.inputOne': 'outputOne',
                'lookupRequests.inputTwo': 'outputTwo',
                'lookupRequests.inputThree': 'outputThree',
                'constants.inputFour': 'outputFour'
              }
            },
            allData: {
              requestBody: body,
              lookupRequests: {
                inputOne: 1,
                inputTwo: 2,
                inputThree: 3
              },
              constants: {
                inputFour: 4,
                inputFive: 5
              }
            }
          }
        }

        const expected = {
          outputZero: 0,
          outputOne: 1,
          outputTwo: 2,
          outputThree: 3,
          outputFour: 4
        }

        createMappedObject(ctx)

        t.deepEqual(ctx.body, expected)
        t.equals(ctx.status, 200)
        t.end()
      }
    )

    t.test(
      'should fail to map data when invalid mapping function referenced',
      t => {
        t.plan(1)
        const ctx = {
          request: {
            body: {
              inputOne: 1,
              inputTwo: 2,
              inputThree: 3
            }
          },
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              inputMapping: {
                data: {
                  key: 'key',
                  transform: {
                    function: 'inValidFunction'
                  }
                }
              }
            },
            allData: {}
          }
        }

        try {
          createMappedObject(ctx)
        } catch (error) {
          t.equals(
            error.message,
            'Object mapping schema invalid: No function exists for key: inValidFunction'
          )
        }
        t.end()
      }
    )

    t.test('should map and create mapping orchestration', t => {
      const body = {
        inputZero: 0
      }
      const ctx = {
        request: {
          body,
          header: {
            [OPENHIM_TRANSACTION_HEADER]: '1233'
          }
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint',
            inputMapping: {
              'requestBody.inputZero': 'outputZero',
              'lookupRequests.inputOne': 'outputOne',
              'constants.inputFour': 'outputFour'
            }
          },
          allData: {
            requestBody: body,
            lookupRequests: {
              inputOne: 1
            },
            constants: {
              inputFour: 4,
              inputFive: 5
            }
          }
        }
      }

      const expected = {
        outputZero: 0,
        outputOne: 1,
        outputFour: 4
      }

      createMappedObject(ctx)

      t.equals(ctx.orchestrations.length, 1)
      t.equals(ctx.orchestrations[0].name, 'Mapping')
      t.deepEqual(ctx.orchestrations[0].response.body, JSON.stringify(expected))
      t.end()
    })

    t.test(
      'should map and create mapping orchestration when orchestration array already exists',
      t => {
        const body = {
          inputZero: 0
        }
        const ctx = {
          request: {
            body,
            header: {
              [OPENHIM_TRANSACTION_HEADER]: '1233'
            }
          },
          orchestrations: [], // empty array supplied
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              inputMapping: {
                'requestBody.inputZero': 'outputZero',
                'lookupRequests.inputOne': 'outputOne',
                'constants.inputFour': 'outputFour'
              }
            },
            allData: {
              requestBody: body,
              lookupRequests: {
                inputOne: 1
              },
              constants: {
                inputFour: 4,
                inputFive: 5
              }
            }
          }
        }

        const expected = {
          outputZero: 0,
          outputOne: 1,
          outputFour: 4
        }

        createMappedObject(ctx)

        t.equals(ctx.orchestrations.length, 1)
        t.equals(ctx.orchestrations[0].name, 'Mapping')
        t.deepEqual(
          ctx.orchestrations[0].response.body,
          JSON.stringify(expected)
        )
        t.end()
      }
    )
  })

  t.test('mapBodyMiddleware()', {autoend: true}, t => {
    t.test('should execute the middle functions', async t => {
      const ctxMock = {
        state: {},
        request: {
          headers: {},
          path: '/path'
        },
        response: {}
      }

      const spy = sinon.spy()
      const createMappedObjectMockRevert = mapper.__set__(
        'createMappedObject',
        spy
      )

      await mapper.mapBodyMiddleware()(ctxMock, () => {})

      t.ok(spy.called)

      createMappedObjectMockRevert()
    })
  })
})
