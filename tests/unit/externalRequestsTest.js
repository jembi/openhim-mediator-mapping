'use strict'

const tap = require('tap')
const nock = require('nock')
const {
  createOrchestration,
  constructOpenhimResponse,
  orchestrateMappingResult,
  setStatusText,
  setKoaResponseBody,
  setKoaResponseBodyFromPrimary,
  createAxiosConfig
} = require('../../src/middleware/externalRequests')

tap.test('External Requests', {autoend: true}, t => {
  t.test('createOrchestration', {autoend: true}, t => {
    t.test("should fail when request's url or method are falsy", t => {
      t.plan(1)

      const request = {
        url: null,
        method: null,
        id: '1223'
      }

      try {
        createOrchestration(request, null, null, null, null, null)
      } catch (error) {
        t.equals(
          error.message,
          'Orchestration creation failed: required parameter not supplied'
        )
      }
    })

    t.test("should fail when request's timestamp is falsy", t => {
      t.plan(1)

      const request = {
        url: 'http://localhost',
        method: 'PUT',
        id: '1232'
      }
      const reqTimestamp = null

      try {
        createOrchestration(request, null, null, reqTimestamp, null)
      } catch (error) {
        t.equals(
          error.message,
          'Orchestration creation failed: required parameter not supplied'
        )
      }
    })

    t.test('should fail when orchestration name is not supplied', t => {
      t.plan(1)

      const request = {
        url: 'http://localhost',
        method: 'PUT',
        id: null
      }
      const reqTimestamp = Date.now()

      try {
        createOrchestration(request, null, null, reqTimestamp, null, null)
      } catch (error) {
        t.equals(
          error.message,
          'Orchestration creation failed: required parameter not supplied'
        )
      }
    })

    t.test('should create orchestration', t => {
      const headers = {'Content-Type': 'application/json'}
      const request = {
        url: 'http://localhost:8000/patient/?name=brainman',
        method: 'PUT',
        id: 'Patient',
        headers
      }
      const reqTimestamp = Date.now()

      const requestBody = {surname: 'raze'}
      const response = {
        body: {
          name: 'brainman',
          surname: 'raze'
        },
        status: 200,
        headers
      }
      const responseTimestamp = Date.now()
      const name = 'Patient'

      const expectedOrch = {
        request: {
          host: 'localhost',
          port: '8000',
          path: '/patient/',
          timestamp: reqTimestamp,
          method: 'PUT',
          queryString: 'name=brainman',
          headers,
          body: requestBody
        },
        response: {
          timestamp: responseTimestamp,
          status: 200,
          headers: headers,
          body: {
            name: 'brainman',
            surname: 'raze'
          }
        },
        name
      }

      const orchestration = createOrchestration(
        request,
        requestBody,
        response,
        reqTimestamp,
        responseTimestamp
      )

      t.deepEqual(expectedOrch, orchestration)
      t.end()
    })
  })

  t.test('constructOpenhimResponse', {autoend: true}, t => {
    t.test('should create the response', t => {
      const timestamp = Date.now()
      const statusText = 'Successful'
      const headers = {'Content-Type': 'application/json'}
      const body = {message: 'success'}
      const status = 200
      const response = {
        headers,
        status,
        body,
        timestamp
      }
      const request = {
        headers,
        host: 'localhost',
        method: 'PUT',
        path: '/patient/',
        port: '8000',
        timestamp: Date.now()
      }

      const orchestrations = [
        {
          request,
          response,
          name: 'Patient'
        }
      ]

      const ctx = {
        orchestrations,
        response,
        statusText
      }

      const expectedResponse = {
        'x-mediator-urn': 'urn:mediator:generic_mapper',
        status: statusText,
        response: response,
        orchestrations: orchestrations
      }

      constructOpenhimResponse(ctx, timestamp)

      t.deepEqual(expectedResponse, JSON.parse(ctx.body))
      t.end()
    })
  })

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
                    url: url,
                    method: method,
                    id: id,
                    primary: true
                  },
                  {
                    url: url2,
                    method: method,
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
                    url: `${url}patient?name=raze`,
                    method: method,
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
                    url: `${url}patient?name=raze`,
                    method: method,
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
                    url: `${url}patient?name=raze`,
                    method: method,
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
                    url: `${url}patient?name=raze`,
                    method: method,
                    id: id,
                    primary: true
                  },
                  {
                    url: `${url}resource?name=raze`,
                    method: method,
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
})
