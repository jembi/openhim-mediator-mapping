'use strict'

const tap = require('tap')
const rewire = require('rewire')
const nock = require('nock')
const myModule = rewire('../../src/middleware/externalRequests')
const orchestrateMappingResult = myModule.__get__('orchestrateMappingResult')
const setStatusText = myModule.__get__('setStatusText')
const setKoaResponseBody = myModule.__get__('setKoaResponseBody')
const setKoaResponseBodyFromPrimary = myModule.__get__(
  'setKoaResponseBodyFromPrimary'
)
const createAxiosConfig = myModule.__get__('createAxiosConfig')
const handleRequestError = myModule.__get__('handleRequestError')

tap.test('External Requests', {autoend: true}, t => {
  t.test('orchestrateMappingResult', {autoend: true}, t => {
    t.test('should not do any orchestration if the mapping fails', async t => {
      const ctx = {
        state: {
          metaData: {
            requests: {}
          }
        }
      }

      await orchestrateMappingResult(ctx)

      t.equals(ctx.orchestrations, undefined)
      t.end()
    })

    t.test(
      'should not do any orchestrations when the requests object is falsy',
      async t => {
        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: null
            }
          }
        }
        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations)
        t.end()
      }
    )

    t.test(
      'should not do any orchestrations when the requests object does not have the response requests',
      async t => {
        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: []
              }
            }
          },
          request: {}
        }

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations, undefined)
        t.end()
      }
    )

    t.test(
      'should not do any orchestrations when request url/method/id is not supplied',
      async t => {
        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [{}]
              }
            }
          },
          request: {}
        }
        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 0)
        t.end()
      }
    )

    t.test(
      'should send requests and record the orchestrations (to a server that is down) (statusText should be Failed)',
      async t => {
        const url = 'http://localhost:8000/'
        const url2 = 'http://localhost:9000/'
        const method = 'PUT'
        const id = '1233243'

        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [
                  {
                    config: {
                      url: url,
                      method: method
                    },
                    id: id,
                    primary: true
                  },
                  {
                    config: {
                      url: url2,
                      method: method
                    },
                    id: id
                  }
                ]
              }
            }
          },
          request: {
            header: {
              'X-OpenHIM-TransactionID': '1232244'
            }
          },
          response: {
            headers: {}
          },
          body: {},
          set: (key, value) => {
            ctx.response.headers[key] = value
          }
        }

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 2)
        t.match(ctx.orchestrations[0].error.message, /ECONNREFUSED/)
        t.match(ctx.body, /Failed/)
        t.end()
      }
    )

    t.test(
      'should send requests and record the orchestrations (response statusText - Successful)',
      async t => {
        const url = 'http://localhost:8000/'
        const method = 'PUT'
        const id = 'Patient'

        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [
                  {
                    config: {
                      url: `${url}patient?name=raze`,
                      method: method
                    },
                    id: id,
                    primary: true
                  }
                ]
              }
            }
          },
          request: {
            header: {
              'X-OpenHIM-TransactionID': '1232244'
            }
          },
          response: {
            headers: {}
          },
          body: {
            surname: 'breez'
          },
          set: (key, value) => {
            ctx.response.headers[key] = value
          }
        }

        const response = {name: 'raze', surname: 'breez'}

        nock(url)
          .put('/patient?name=raze')
          .reply(200, response)

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 1)
        t.deepEqual(ctx.orchestrations[0].response.body, response)

        // The response statusText should be set to Successful
        t.match(ctx.body, /Successful/)
        t.end()
      }
    )

    t.test(
      'should not record orchestrations if response is not being sent to the openhim',
      async t => {
        const url = 'http://localhost:8000/'
        const method = 'PUT'
        const id = 'Patient'

        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [
                  {
                    config: {
                      url: `${url}patient?name=raze`,
                      method: method
                    },
                    id: id,
                    primary: true
                  }
                ]
              }
            }
          },
          request: {
            header: {}
          },
          response: {
            headers: {}
          },
          body: {
            surname: 'breez'
          },
          set: (key, value) => {
            ctx.response.headers[key] = value
          }
        }

        const response = {name: 'raze', surname: 'breez'}

        nock(url)
          .put('/patient?name=raze')
          .reply(200, response)

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 0)

        t.deepEqual(ctx.body, {Patient: response})
        t.end()
      }
    )

    t.test(
      "should send requests and set the response body's statusText to Completed",
      async t => {
        const url = 'http://localhost:8000/'
        const method = 'PUT'
        const id = 'Patient'

        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [
                  {
                    config: {
                      url: `${url}patient?name=raze`,
                      method: method
                    },
                    id: id,
                    primary: true
                  }
                ]
              }
            }
          },
          request: {
            header: {
              'X-OpenHIM-TransactionID': '1232244'
            }
          },
          response: {
            headers: {}
          },
          body: {
            surname: 'breez'
          },
          set: (key, value) => {
            ctx.response.headers[key] = value
          }
        }

        const response = {name: 'raze', surname: 'breez'}

        nock(url)
          .put('/patient?name=raze')
          .reply(400, response)

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 1)
        t.match(ctx.body, /Completed/)
        t.end()
      }
    )

    t.test(
      "should set the response body's statusText to 'Completed with error(s)' (error on non primary request",
      async t => {
        const url = 'http://localhost:8000/'
        const method = 'PUT'
        const id = 'Patient'

        const ctx = {
          status: 200,
          state: {
            metaData: {
              requests: {
                response: [
                  {
                    config: {
                      url: `${url}patient?name=raze`,
                      method: method
                    },
                    id: id,
                    primary: true
                  },
                  {
                    config: {
                      url: `${url}resource?name=raze`,
                      method: method
                    },
                    id: id
                  }
                ]
              }
            }
          },
          request: {
            header: {
              'X-OpenHIM-TransactionID': '1232244'
            }
          },
          response: {
            headers: {}
          },
          body: {
            surname: 'breez'
          },
          set: (key, value) => {
            ctx.response.headers[key] = value
          }
        }

        const response = {name: 'raze', surname: 'breez'}

        nock(url)
          .put('/patient?name=raze')
          .reply(200, response)

        await orchestrateMappingResult(ctx)

        t.equals(ctx.orchestrations.length, 2)
        t.match(ctx.body, /Completed with error/)
        t.end()
      }
    )
  })

  t.test('setStatusText()', {autoend: true}, t => {
    t.test('should set the status to Failed', t => {
      const ctx = {
        primaryReqFailError: true
      }

      setStatusText(ctx)

      t.equals(ctx.statusText, 'Failed')
      t.end()
    })

    t.test('should set the status to Completed with error(s)', t => {
      const ctx = {
        secondaryFailError: true
      }

      setStatusText(ctx)

      t.equals(ctx.statusText, 'Completed with error(s)')
      t.end()
    })

    t.test('should set the status to Completed', t => {
      const ctx = {
        primaryCompleted: true
      }

      setStatusText(ctx)

      t.equals(ctx.statusText, 'Completed')
      t.end()
    })

    t.test('should set the status to Successful', t => {
      const ctx = {}

      setStatusText(ctx)

      t.equals(ctx.statusText, 'Successful')
      t.end()
    })
  })

  t.test('setKoaResponseBody()', {autoend: true}, t => {
    t.test('should set the koa response', t => {
      const ctx = {
        body: {}
      }
      const body = {message: 'success'}
      const request = {
        id: '1233'
      }

      setKoaResponseBody(ctx, request, body)
      t.deepEqual(ctx.body[request.id], body)
      t.end()
    })

    t.test('should not set the koa response (primary response exists)', t => {
      const ctx = {
        body: {},
        hasPrimaryRequest: true
      }

      const request = {
        id: '1233'
      }

      setKoaResponseBody(ctx, request, null)
      t.equals(ctx.body[request.id], undefined)
      t.end()
    })
  })

  t.test('setKoaResponseFromPrimary()', {autoend: true}, t => {
    t.test('should set the koa response', t => {
      const ctx = {
        body: {}
      }
      const body = {message: 'success'}
      const request = {
        id: '1233'
      }

      setKoaResponseBodyFromPrimary(ctx, request, body)
      t.deepEqual(ctx.body[request.id], body)
      t.equals(ctx.hasPrimaryRequest, true)
      t.end()
    })
  })

  t.test('createAxiosConfig()', {autoend: true}, t => {
    t.test('should create the axios config', t => {
      const request = {
        url: 'http://localhost',
        method: 'GET',
        credentials: {
          username: 'The-messiah',
          password: 'password'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const body = {message: 'Successful'}

      const config = createAxiosConfig(request, body)

      t.equals(config.url, request.url)
      t.equals(config.method, request.method)
      t.deepEqual(config.auth, request.credentials)
      t.deepEqual(config.headers, request.headers)
      t.deepEqual(config.body, body)
      t.end()
    })
  })

  t.test('handleRequestError()', {autoend: true}, t => {
    t.test('should return the error when there is a connection error', t => {
      const ctx = {
        body: {}
      }
      const request = {}
      const err = {
        message: 'ECONREFUSED'
      }

      const result = handleRequestError(ctx, request, err)

      t.deepEqual(result.error, err)
      t.end()
    })

    t.test(
      'should set the property "primaryReqFailError" when response status is 500',
      t => {
        const ctx = {
          body: {}
        }
        const request = {
          primary: true
        }
        const err = {
          response: {
            data: {message: 'Internal Server Error'},
            status: 500
          }
        }

        const result = handleRequestError(ctx, request, err)

        t.deepEqual(result.response.body, err.response.data)
        t.equals(ctx.primaryReqFailError, true)
        t.end()
      }
    )

    t.test(
      'should set the property "primaryCompleted" on ctx when response status is not 2xx and 5xx',
      t => {
        const ctx = {
          body: {}
        }
        const request = {
          primary: true
        }
        const err = {
          response: {
            data: {message: 'Bad request'},
            status: 400
          }
        }

        const result = handleRequestError(ctx, request, err)

        t.deepEqual(result.response.body, err.response.data)
        t.equals(ctx.primaryCompleted, true)
        t.end()
      }
    )
  })
})
