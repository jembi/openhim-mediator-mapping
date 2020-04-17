'use strict'

const tap = require('tap')
const {DateTime} = require('luxon')
const rewire = require('rewire')

const initiate = rewire('../../src/middleware/initiate')

const extractByType = initiate.__get__('extractByType')
const extractStateValues = initiate.__get__('extractStateValues')
const updateEndpointState = initiate.__get__('updateEndpointState')

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

    t.test('should create state object for supplied states', t => {
      t.plan(1)

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

      try {
        updateEndpointState(ctx, endpoint)
        t.pass()
      } catch (err) {
        t.fail()
      }
    })
  })
})
