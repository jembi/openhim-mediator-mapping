'use strict'

const tap = require('tap')
const {DateTime} = require('luxon')
const rewire = require('rewire')
const sinon = require('sinon')

const initiate = rewire('../../src/middleware/initiate')
const dbServicesState = require('../../src/db/services/states')

const extractByType = initiate.__get__('extractByType')
const extractStateValues = initiate.__get__('extractStateValues')
const updateEndpointState = initiate.__get__('updateEndpointState')
const getEndpointByPath = initiate.__get__('getEndpointByPath')

const endpointStart = DateTime.utc().toISO()
const defaultEndpoint = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Sample Endpoint',
  endpoint: {
    pattern: '/sample'
  },
  transformation: {
    input: 'JSON',
    output: 'JSON'
  },
  inputValidation: {},
  inputMapping: {},
  state: {
    extract: {
      requestBody: {
        statePropertyText: 'mainObject.nestedObject.text',
        statePropertyArray0: 'mainObject.anotherNestedObject.list[0]',
        statePropertyArray2: 'mainObject.anotherNestedObject.list[2]'
      },
      responseBody: {
        statePropertyValueOne: '[1].text',
        statePropertyValueTwo: '[2].text'
      },
      query: {
        statePropertyFromKey: 'queryParamKey'
      },
      lookupRequests: {
        lookup1value: 'firstRequest.text',
        lookup2value: 'secondRequest.text',
        lookup2ArrayValue: 'secondRequest.array[1]'
      }
    }
  }
}
const initialCtx = {
  state: {
    uuid: '7asd596a5s0d5s0das0d7a5sd08'
  },
  allData: {
    lookupRequests: {
      firstRequest: {
        text: 'a response value from the first request'
      },
      secondRequest: {
        text: 'a response value from the second request',
        array: ['one', 'two', 'three']
      }
    },
    query: {
      queryParamKey: 'queryParamValue'
    },
    requestBody: {
      mainObject: {
        nestedObject: {
          text: 'a property on a nested object'
        },
        anotherNestedObject: {
          list: ['one', 'two', 'three']
        }
      }
    },
    responseBody: [{text: 'one'}, {text: 'two'}, {text: 'three'}],
    timestamps: {
      endpointStart
    }
  }
}

tap.test('Initiate Middleware', {autoend: true}, t => {
  const sandbox = sinon.createSandbox()

  t.afterEach(async () => {
    sandbox.restore()
  })

  t.test('extractByType', {autoend: true}, t => {
    t.test('should return an empty object when "type" not supplied', t => {
      t.plan(1)

      const type = null
      const extract = {
        query: {
          stateQueryParam: 'queryParamKey'
        }
      }
      const allData = {
        query: {
          queryParamKey: 'queryParamValue'
        }
      }

      const extractedObject = extractByType(type, extract, allData)

      t.deepEqual(extractedObject, {})
    })

    t.test('should return an empty object when "extract" not supplied', t => {
      t.plan(1)

      const type = 'query'
      const extract = null
      const allData = {
        query: {
          queryParamKey: 'queryParamValue'
        }
      }

      const extractedObject = extractByType(type, extract, allData)

      t.deepEqual(extractedObject, {})
    })

    t.test('should return an empty object when "allData" not supplied', t => {
      t.plan(1)

      const type = 'query'
      const extract = {
        query: {
          stateQueryParam: 'queryParamKey'
        }
      }
      const allData = null

      const extractedObject = extractByType(type, extract, allData)

      t.deepEqual(extractedObject, {})
    })

    t.test(
      'should return an object containing the extracted state value',
      t => {
        t.plan(1)

        const type = 'query'
        const extract = {
          query: {
            stateQueryParam: 'queryParamKey'
          }
        }
        const allData = {
          query: {
            queryParamKey: 'queryParamValue'
          }
        }

        const extractedObject = extractByType(type, extract, allData)

        t.deepEqual(extractedObject, {
          stateQueryParam: 'queryParamValue'
        })
      }
    )
  })

  t.test('extractStateValues', {autoend: true}, t => {
    t.test(
      'should return default captured state (system timestamps) when no extract properties supplied',
      t => {
        t.plan(3)

        const endpointStart = DateTime.utc().toISO()

        const ctx = {
          state: {
            allData: {
              requestBody: {},
              query: {
                queryParamKey: 'queryParamValue'
              },
              timestamps: {
                endpointStart
              }
            }
          }
        }
        const extract = {}

        const extractedStateValues = extractStateValues(ctx, extract)

        t.equal(
          extractedStateValues.system.timestamps.endpointStart,
          endpointStart
        )
        t.ok(extractedStateValues.system.timestamps.endpointEnd)
        t.ok(extractedStateValues.system.timestamps.endpointDuration)
      }
    )

    t.test('should return captured state for specified extract details', t => {
      t.plan(5)

      const endpointStart = DateTime.utc().toISO()

      const ctx = {
        state: {
          allData: {
            lookupRequests: {
              firstRequest: {
                text: 'a response value from the first request'
              },
              secondRequest: {
                text: 'a response value from the second request',
                array: ['one', 'two', 'three']
              }
            },
            query: {
              queryParamKey: 'queryParamValue'
            },
            requestBody: {
              mainObject: {
                nestedObject: {
                  text: 'a property on a nested object'
                },
                anotherNestedObject: {
                  list: ['one', 'two', 'three']
                }
              }
            },
            responseBody: [{text: 'one'}, {text: 'two'}, {text: 'three'}],
            timestamps: {
              endpointStart
            }
          }
        }
      }
      const extract = {
        requestBody: {
          statePropertyText: 'mainObject.nestedObject.text',
          statePropertyArray0: 'mainObject.anotherNestedObject.list[0]',
          statePropertyArray2: 'mainObject.anotherNestedObject.list[2]'
        },
        responseBody: {
          statePropertyValueOne: '[1].text',
          statePropertyValueTwo: '[2].text'
        },
        query: {
          statePropertyFromKey: 'queryParamKey'
        },
        lookupRequests: {
          lookup1value: 'firstRequest.text',
          lookup2value: 'secondRequest.text',
          lookup2ArrayValue: 'secondRequest.array[1]'
        }
      }

      const extractedStateValues = extractStateValues(ctx, extract)

      t.equal(
        extractedStateValues.system.timestamps.endpointStart,
        endpointStart
      )

      t.deepEqual(extractedStateValues.requestBody, {
        statePropertyText: 'a property on a nested object',
        statePropertyArray0: 'one',
        statePropertyArray2: 'three'
      })
      t.deepEqual(extractedStateValues.responseBody, {
        statePropertyValueOne: 'two',
        statePropertyValueTwo: 'three'
      })
      t.deepEqual(extractedStateValues.query, {
        statePropertyFromKey: 'queryParamValue'
      })
      t.deepEqual(extractedStateValues.lookupRequests, {
        lookup1value: 'a response value from the first request',
        lookup2value: 'a response value from the second request',
        lookup2ArrayValue: 'two'
      })
    })
  })

  t.test('updateEndpointState', {autoend: true}, t => {
    t.test('should throw when endpoint has not been defined', async t => {
      t.plan(1)

      const endpoint = null
      const ctx = Object.assign({}, initialCtx)

      try {
        await updateEndpointState(ctx, endpoint)
      } catch (error) {
        t.equal(
          error.message,
          'No metaData supplied for updating state for this endpoint'
        )
      }
    })

    t.test('should throw when metaData is an empty objectd', async t => {
      t.plan(1)

      const metaData = {}
      const ctx = Object.assign(initialCtx, {metaData})

      try {
        await updateEndpointState(ctx, metaData)
      } catch (error) {
        t.equal(
          error.message,
          'No metaData supplied for updating state for this endpoint'
        )
      }
    })

    t.test(
      'should throw if "createEndpointState" returns an error',
      async t => {
        t.plan(2)

        const endpointStart = DateTime.utc().toISO()

        const ctx = {
          state: {
            allData: {
              lookupRequests: {
                firstRequest: {
                  text: 'a response value from the first request'
                },
                secondRequest: {
                  text: 'a response value from the second request',
                  array: ['one', 'two', 'three']
                }
              },
              query: {
                queryParamKey: 'queryParamValue'
              },
              requestBody: {
                mainObject: {
                  nestedObject: {
                    text: 'a property on a nested object'
                  },
                  anotherNestedObject: {
                    list: ['one', 'two', 'three']
                  }
                }
              },
              responseBody: [{text: 'one'}, {text: 'two'}, {text: 'three'}],
              timestamps: {
                endpointStart
              }
            }
          }
        }
        const endpoint = defaultEndpoint

        // stub for the call to insert data into mongo
        const stub = sandbox
          .stub(dbServicesState, 'createEndpointState')
          .resolves(
            new Promise((_resolve, reject) => {
              reject('Mongo connection error')
            })
          )

        try {
          await updateEndpointState(ctx, endpoint)
          t.fail()
        } catch (err) {
          t.equal(err.message, 'Mongo connection error')
        }

        // verify stub was called
        t.ok(stub.called)
      }
    )

    t.test('should create state record', async t => {
      t.plan(2)

      const endpointStart = DateTime.utc().toISO()

      const ctx = {
        state: {
          allData: {
            lookupRequests: {
              firstRequest: {
                text: 'a response value from the first request'
              },
              secondRequest: {
                text: 'a response value from the second request',
                array: ['one', 'two', 'three']
              }
            },
            query: {
              queryParamKey: 'queryParamValue'
            },
            requestBody: {
              mainObject: {
                nestedObject: {
                  text: 'a property on a nested object'
                },
                anotherNestedObject: {
                  list: ['one', 'two', 'three']
                }
              }
            },
            responseBody: [{text: 'one'}, {text: 'two'}, {text: 'three'}],
            timestamps: {
              endpointStart
            }
          }
        }
      }
      const endpoint = defaultEndpoint

      // stub for the call to insert data into mongo
      const stub = sandbox
        .stub(dbServicesState, 'createEndpointState')
        .resolves(
          new Promise(resolve => {
            resolve({
              system: {
                timestamps: {
                  endpointDuration: {
                    milliseconds: 102
                  },
                  endpointStart: '2020-04-20T13:31:11.301Z',
                  endpointEnd: '2020-04-20T13:31:11.403Z'
                }
              },
              _id: '5e9da41f963bbe377dee075c',
              _endpointReference: '5e99657dc4b9120472fdf4eb'
            })
          })
        )

      try {
        await updateEndpointState(ctx, endpoint)
        t.pass()
      } catch (err) {
        t.fail()
      }

      // verify stub was called
      t.ok(stub.called)
    })
  })

  t.test('getEndpointByPath', {autoend: true}, t => {
    t.test('should return the endpoint for the supplied path', async t => {
      t.plan(3)

      const endpointCache = [
        {
          _id: 'endpoint1',
          name: 'Endpoint 1',
          endpoint: {
            pattern: '/path'
          }
        },
        {
          _id: 'endpoint2',
          name: 'Endpoint 2',
          endpoint: {
            pattern: '/path-2'
          }
        }
      ]

      const endpointCacheMockRevert = initiate.__set__(
        'endpointCache',
        endpointCache
      )

      const endpoint = getEndpointByPath('/path')

      endpointCacheMockRevert()

      t.equal(endpoint._id, 'endpoint1')
      t.equal(endpoint.name, 'Endpoint 1')
      t.equal(endpoint.endpoint.pattern, '/path')
    })

    t.test('should return null if path not found', async t => {
      t.plan(1)

      const endpointCache = [
        {
          _id: 'endpoint1',
          name: 'Endpoint 1',
          endpoint: {
            pattern: '/path'
          }
        },
        {
          _id: 'endpoint2',
          name: 'Endpoint 2',
          endpoint: {
            pattern: '/path-2'
          }
        }
      ]

      const endpointCacheMockRevert = initiate.__set__(
        'endpointCache',
        endpointCache
      )

      const endpoint = getEndpointByPath('/path-doesnt-exist')

      endpointCacheMockRevert()

      t.notOk(endpoint) // null
    })
  })

  t.test('initiateContextMiddleware', {autoend: true}, t => {
    t.test(
      'should return with a ctx.status of 404 when endpoint not found',
      async t => {
        t.plan(3)

        const ctxMock = {
          request: {
            headers: {},
            path: '/path'
          },
          response: {}
        }
        const noop = () => {}
        await initiate.initiateContextMiddleware()(ctxMock, noop)

        t.equal(ctxMock.response.type, 'application/json')
        t.equal(ctxMock.response.body, 'Unknown Endpoint: /path')
        t.equal(ctxMock.status, 404)
      }
    )

    t.test(
      'should return with a ctx.status of 404 and OpenHIM orchestration when "x-openhim-transactionid" header supplied',
      async t => {
        t.plan(3)

        const ctxMock = {
          request: {
            headers: {
              'x-openhim-transactionid': '5e99657dc4b9120472fdf4eb'
            },
            path: '/path'
          },
          response: {}
        }
        const noop = () => {}
        await initiate.initiateContextMiddleware()(ctxMock, noop)

        t.equal(ctxMock.response.type, 'application/json+openhim')
        t.equal(ctxMock.response.body, 'Unknown Endpoint: /path')
        t.equal(ctxMock.status, 404)
      }
    )

    t.test('should handle failure on "updateEndpointState"', async t => {
      t.plan(5)

      const ctxMock = {
        state: {},
        request: {
          headers: {},
          path: '/path'
        },
        response: {}
      }

      const getEndpointByPathMockRevert = initiate.__set__(
        'getEndpointByPath',
        () => {
          return {
            _id: 'endpointId'
          }
        }
      )
      const updateEndpointStateMockRevert = initiate.__set__(
        'updateEndpointState',
        () => {
          throw new Error('Mongo connection error')
        }
      )
      // stub for the call to read data from mongo
      const stub = sandbox
        .stub(dbServicesState, 'readLatestEndpointStateById')
        .resolves(
          new Promise(resolve => {
            resolve({
              system: {
                timestamps: {
                  endpointDuration: {
                    milliseconds: 102
                  },
                  endpointStart: '2020-04-20T13:31:11.301Z',
                  endpointEnd: '2020-04-20T13:31:11.403Z'
                }
              }
            })
          })
        )

      // await initiate.initiateContextMiddleware()(ctxMock, noop)
      await initiate.initiateContextMiddleware()(ctxMock, () => {
        t.ok(stub.called)
        t.ok(ctxMock.state.uuid)
        t.equal(ctxMock.state.metaData._id, 'endpointId')
      })

      // revert the mock function changes
      getEndpointByPathMockRevert()
      updateEndpointStateMockRevert()

      t.equal(ctxMock.status, 500)
      t.equal(
        ctxMock.body.error,
        'Failed to update endpoint state: Mongo connection error'
      )
    })

    t.test('should complete first middleware pass', async t => {
      t.plan(3)

      const ctxMock = {
        state: {},
        request: {
          headers: {},
          path: '/path'
        },
        response: {}
      }

      const getEndpointByPathMockRevert = initiate.__set__(
        'getEndpointByPath',
        () => {
          return {
            // dummy endpoint object
            _id: 'endpointId'
          }
        }
      )
      // stub for the call to read data from mongo
      const stub = sandbox
        .stub(dbServicesState, 'readLatestEndpointStateById')
        .resolves(
          new Promise(resolve => {
            resolve({
              system: {
                timestamps: {
                  endpointDuration: {
                    milliseconds: 102
                  },
                  endpointStart: '2020-04-20T13:31:11.301Z',
                  endpointEnd: '2020-04-20T13:31:11.403Z'
                }
              }
            })
          })
        )

      // await initiate.initiateContextMiddleware()(ctxMock, noop)
      await initiate.initiateContextMiddleware()(ctxMock, () => {
        t.ok(stub.called)

        t.ok(ctxMock.state.uuid)
        t.equal(ctxMock.state.metaData._id, 'endpointId')
      })

      // revert the mock function changes
      getEndpointByPathMockRevert()
    })
  })
})
