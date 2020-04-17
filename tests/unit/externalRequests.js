'use strict'

const nock = require('nock')
const rewire = require('rewire')
const tap = require('tap')

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
const validateRequestStatusCode = externalRequests.__get__(
  'validateRequestStatusCode'
)
const performRequests = externalRequests.__get__('performRequests')
const prepareLookupRequests = externalRequests.__get__('prepareLookupRequests')
const prepareRequestConfig = externalRequests.__get__('prepareRequestConfig')

tap.test('External Requests', {autoend: true}, t => {
  t.test('validateRequestStatusCode', {autoend: true}, t => {
    t.test('should return false if the status is not allowed', t => {
      const allowedStatuses = [200, 202]
      const status = 500

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equals(valid, false)
      t.end()
    })

    t.test('should return true if status is allowed', t => {
      const allowedStatuses = [200, 202]
      const status = 200

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equals(valid, true)
      t.end()
    })

    t.test('should return true if status is allowed (wildcard status)', t => {
      const allowedStatuses = ['2xx', 400]
      const status = 202

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equals(valid, true)
      t.end()
    })
  })

  t.test('performRequests', {autoend: true}, t => {
    t.test('should create orchestration object', t => {
      const ctx = {}
      const requests = []

      performRequests(requests, ctx)
      t.equals(!ctx.orchestrations, false)
      t.end()
    })

    t.test('should create orchestrations array', t => {
      const ctx = {}
      const requests = []

      performRequests(requests, ctx)
      t.equals(!ctx.orchestrations, false)
      t.end()
    })

    t.test(
      'should throw error and create orchestration when one lookup fails( request to server that is down)',
      async t => {
        const url = 'http://localhost:8000/'
        const url2 = 'http://localhost:9000/'
        const method = 'PUT'
        const id = '1233243'

        const requests = [
          {
            config: {
              url: url,
              method: method
            },
            id: id
          },
          {
            config: {
              url: url2,
              method: method
            },
            id: id
          }
        ]

        const ctx = {
          state: {
            metaData: {
              requests: {}
            }
          },
          request: {
            header: {
              'x-openhim-transactionid': '1232244'
            }
          }
        }

        try {
          await Promise.all(performRequests(requests, ctx))
        } catch (error) {
          t.equals(ctx.orchestrations.length, 1)
          t.match(
            error.message,
            /No response from lookup '1233243'. connect ECONNREFUSED/
          )
          t.end()
        }
      }
    )

    t.test('should do lookups and create orchestrations', async t => {
      const url = 'http://localhost:4000/'

      nock(url)
        .get('/patient')
        .reply(200, 'Body')

      const method = 'GET'
      const id = '123'

      const requests = [
        {
          config: {
            url: `${url}patient`,
            method: method
          },
          id: id
        }
      ]

      const ctx = {
        state: {
          metaData: {
            requests: {}
          }
        },
        request: {
          header: {
            'x-openhim-transactionid': '1232244'
          }
        }
      }

      await Promise.all(performRequests(requests, ctx)).then(res => {
        t.deepEqual(res[0], {'123': 'Body'})
        t.equals(ctx.orchestrations.length, 1)
        t.end()
      })
    })
  })

  t.test('prepareLookupRequests', {autoend: true}, t => {
    t.test(
      'should not do any lookups when requests metadata object is empty',
      t => {
        const ctx = {
          state: {
            metaData: {}
          }
        }
        prepareLookupRequests(ctx)

        t.equals(!ctx.orchestrations, true)
        t.end()
      }
    )
    t.test('should throw error when lookup request fails', async t => {
      const url = 'http://localhost:4000/'

      const method = 'GET'

      const ctx = {
        request: {
          header: {
            'x-openhim-transactionid': '123'
          }
        },
        state: {
          metaData: {
            requests: {
              lookup: [
                {
                  config: {
                    url: `${url}patient`,
                    method: method
                  },
                  id: 'safari'
                }
              ]
            }
          }
        }
      }
      try {
        await prepareLookupRequests(ctx)
      } catch (err) {
        t.match(err.message, /No response from lookup/)
        t.end()
      }
    })

    t.test('should do the lookup and create orchestration', async t => {
      const url = 'http://localhost:4000/'

      nock(url)
        .get('/patient')
        .times(2)
        .reply(200, 'Body')

      const method = 'GET'

      const ctx = {
        request: {
          header: {
            'x-openhim-transactionid': '123'
          }
        },
        state: {
          metaData: {
            requests: {
              lookup: [
                {
                  config: {
                    url: `${url}patient`,
                    method: method
                  },
                  id: 'safari'
                },
                {
                  config: {
                    url: `${url}patient`,
                    method: method
                  },
                  id: 'chrome'
                }
              ]
            }
          }
        }
      }
      await prepareLookupRequests(ctx)

      t.equals(ctx.orchestrations.length, 2)
      t.ok(ctx.lookupRequests)
      t.deepEqual(ctx.lookupRequests, {chrome: 'Body', safari: 'Body'})
      t.end()
    })
  })

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

  t.test('prepareRequestConfig', {autoend: true}, t => {
    t.test('should create request config with no data and query params', t => {
      const requestDetails = {
        config: {
          url: `localhost:8080`,
          method: 'GET'
        }
      }
      const requestBody = null
      const queryParams = null

      const requestConfig = prepareRequestConfig(
        requestDetails,
        requestBody,
        queryParams
      )
      t.equals(!requestConfig.data, true)
      t.equals(!requestConfig.params, true)
      t.end()
    })

    t.test('should add data and query params to request config object', t => {
      const requestDetails = {
        config: {
          url: `localhost:8080`,
          method: 'GET'
        }
      }
      const requestBody = 'Body'
      const queryParams = {
        id: 'sanders'
      }

      const requestConfig = prepareRequestConfig(
        requestDetails,
        requestBody,
        queryParams
      )
      t.equals(requestConfig.data, requestBody)
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

  t.test('addRequestQueryParameters', {autoend: true}, t => {
    t.test('should create request query parameters', t => {
      const ctx = {
        request: {
          query: {
            code: '1233',
            name: 'brad'
          },
          body: {
            id: '1233',
            place: {
              address: '1 flow street'
            },
            status: [
              {},
              {
                rich: {
                  status: [
                    {
                      sp: 'rich rich'
                    }
                  ]
                }
              }
            ]
          }
        }
      }
      const postfix = ':thesecond'
      const prefix = 'sir:'
      const request = {
        params: {
          id: {
            path: 'payload.id'
          },
          place: {
            path: 'payload.place.address'
          },
          status: {
            path: 'payload.status[1].rich.status[0].sp'
          },
          code: {
            path: 'query.code'
          },
          name: {
            path: 'query.name',
            postfix,
            prefix
          },
          surname: {
            path: 'query.surname',
            postfix,
            prefix
          }
        }
      }

      const params = addRequestQueryParameters(ctx, request)

      t.equals(params.id, ctx.request.body.id)
      t.equals(params.place, ctx.request.body.place.address)
      t.equals(params.code, ctx.request.query.code)
      t.equals(params.status, ctx.request.body.status[1].rich.status[0].sp)
      t.equals(params.name, `${prefix + ctx.request.query.name + postfix}`)
      t.end()
    })
  })
})
