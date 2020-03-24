'use strict'

const tap = require('tap')
const rewire = require('rewire')
const nock = require('nock')
const externalRequests = rewire('../../src/middleware/externalRequests')
const prepareResponseRequests = externalRequests.__get__(
  'prepareResponseRequests'
)
const setKoaResponseBody = externalRequests.__get__('setKoaResponseBody')
const setKoaResponseBodyFromPrimary = externalRequests.__get__(
  'setKoaResponseBodyFromPrimary'
)
const handleRequestError = externalRequests.__get__('handleRequestError')
const addRequestQueryParameters = externalRequests.__get__(
  'addRequestQueryParameters'
)

tap.test('External Requests', {autoend: true}, t => {
  t.test('prepareResponseRequests', {autoend: true}, t => {
    t.test('should not do any orchestration if the mapping fails', async t => {
      const ctx = {
        state: {
          metaData: {
            requests: {}
          }
        }
      }

      await prepareResponseRequests(ctx)

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
        await prepareResponseRequests(ctx)

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

        await prepareResponseRequests(ctx)

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
        await prepareResponseRequests(ctx)

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
              'x-openhim-transactionid': '1232244'
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

        await prepareResponseRequests(ctx)

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
                    id: 'Patient',
                    primary: true
                  }
                ]
              }
            }
          },
          request: {
            header: {
              'x-openhim-transactionid': '1232244'
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

        await prepareResponseRequests(ctx)

        t.equals(ctx.orchestrations.length, 1)
        t.deepEqual(
          ctx.orchestrations[0].response.body,
          JSON.stringify(response)
        )

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

        await prepareResponseRequests(ctx)

        t.equals(ctx.orchestrations.length, 0)

        t.deepEqual(ctx.body, response)
        t.end()
      }
    )

    t.test('prepareLookupRequests', {autoend: true}, t => {
      t.test('should throw an error if any promise in the array fails', t => {
        t.plan(2)

        const performRequestsStub = externalRequests.__set__(
          'performRequests',
          () => [Promise.resolve('Success'), Promise.reject('Fail')]
        )

        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              requests: {
                lookup: [
                  {
                    // first lookup request config - responds with success
                  },
                  {
                    // second lookup request config - responds with fail
                  }
                ]
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx).catch(err => {
          performRequestsStub()
          t.type(err, Error)
          t.equal(err.message, 'Rejected Promise: Fail')
        })
      })

      t.test(
        'should add response data to the ctx when all promises resolve',
        t => {
          t.plan(1)

          const performRequestsStub = externalRequests.__set__(
            'performRequests',
            () => [
              Promise.resolve({test1: 'testA'}),
              Promise.resolve({test2: 'testB'})
            ]
          )

          const ctx = {
            state: {
              uuid: 'randomUidForRequest',
              metaData: {
                name: 'Testing endpoint',
                requests: {
                  lookup: [
                    {
                      // first lookup request config - responds with success
                    },
                    {
                      // second lookup request config - responds with success
                    }
                  ]
                }
              }
            }
          }

          const prepareLookupRequests = externalRequests.__get__(
            'prepareLookupRequests'
          )

          prepareLookupRequests(ctx).then(() => {
            t.same({test1: 'testA', test2: 'testB'}, ctx.lookupRequests)
            performRequestsStub()
          })
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
                'x-openhim-transactionid': '1232244'
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

          await prepareResponseRequests(ctx)

          t.equals(ctx.orchestrations.length, 1)
          t.match(ctx.body, /Completed/)
          t.end()
        }
      )

      t.test(
        "should set the response body's statusText to 'Completed with error(s)' when there is an error on a non-primary request",
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
                'x-openhim-transactionid': '1232244'
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

          await prepareResponseRequests(ctx)

          t.equals(ctx.orchestrations.length, 2)
          t.match(ctx.body, /Completed with error/)
          t.end()
        }
      )
    })

    t.test(
      'should not reach the request making function is there is no lookup config',
      t => {
        let called = false
        const performRequestsStub = externalRequests.__set__({
          performRequests: () => {
            called = true
          }
        })

        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              requests: {
                // no lookup config
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx)

        performRequestsStub()
        t.equals(called, false, 'performRequestsStub should not be called')
        t.end()
      }
    )
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
      t.deepEqual(ctx.body, body)
      t.equals(ctx.hasPrimaryRequest, true)
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
        message: 'ECONNREFUSED'
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
        t.equals(
          ctx.routerResponseStatuses.includes('primaryReqFailError'),
          true
        )
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
        t.equals(ctx.routerResponseStatuses.includes('primaryCompleted'), true)
        t.end()
      }
    )
  })
  t.test('validateStatus', {autoend: true}, t => {
    t.test('should resolve wildcard status', t => {
      t.plan(4)

      // Example wildcard for 200 range
      const allowedStatuses = ['2xx', 403]

      const validateStatus = externalRequests.__get__(
        'validateRequestStatusCode'
      )

      // The validate status function returns a function that
      // can be used to apply different rules from within the axios config
      const statusValidator = validateStatus(allowedStatuses)
      t.ok(statusValidator(200))
      t.ok(statusValidator(299))
      t.ok(statusValidator(403))
      t.notOk(statusValidator(300))
    })
  })

  t.test('addRequestQueryParameters', {autoend: true}, t => {
    t.test('should create request query parameters', t => {
      const ctx = {
        externalRequestsQueryParams: {
          id: '1233',
          place: '1 flow street'
        }
      }
      const request = {
        params: {
          id: '',
          place: ''
        }
      }

      const params = addRequestQueryParameters(ctx, request)

      t.equals(params.id, ctx.externalRequestsQueryParams.id)
      t.equals(params.place, ctx.externalRequestsQueryParams.place)
      t.end()
    })
  })
})
