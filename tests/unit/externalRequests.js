'use strict'

const nock = require('nock')
const rewire = require('rewire')
const tap = require('tap')
const sinon = require('sinon')

const {OPENHIM_TRANSACTION_HEADER} = require('../../src/constants')
const kafka = require('../../src/kafka')

const externalRequests = rewire('../../src/middleware/externalRequests')

const prepareResponseRequests = externalRequests.__get__(
  'prepareResponseRequests'
)
const setKoaResponseBody = externalRequests.__get__('setKoaResponseBody')
const setKoaResponseBodyAndHeadersFromPrimary = externalRequests.__get__(
  'setKoaResponseBodyAndHeadersFromPrimary'
)
const handleRequestError = externalRequests.__get__('handleRequestError')
const addRequestQueryParameters = externalRequests.__get__(
  'addRequestQueryParameters'
)
const validateRequestStatusCode = externalRequests.__get__(
  'validateRequestStatusCode'
)
const performLookupRequests = externalRequests.__get__('performLookupRequests')
const prepareLookupRequests = externalRequests.__get__('prepareLookupRequests')
const prepareRequestConfig = externalRequests.__get__('prepareRequestConfig')
const resolveRequestUrl = externalRequests.__get__('resolveRequestUrl')

tap.test('External Requests', {autoend: true}, t => {
  t.test('validateRequestStatusCode', {autoend: true}, t => {
    t.test('should return false if the status is not allowed', t => {
      const allowedStatuses = [200, 202]
      const status = 500

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equal(valid, false)
      t.end()
    })

    t.test('should return true if status is allowed', t => {
      const allowedStatuses = [200, 202]
      const status = 200

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equal(valid, true)
      t.end()
    })

    t.test('should return true if status is allowed (wildcard status)', t => {
      const allowedStatuses = ['2xx', 400]
      const status = 202

      const valid = validateRequestStatusCode(allowedStatuses)(status)
      t.equal(valid, true)
      t.end()
    })
  })

  t.test('performLookupRequests', {autoend: true}, t => {
    t.test('should create orchestration object', t => {
      const ctx = {}
      const requests = []

      performLookupRequests(ctx, requests)
      t.ok(ctx.orchestrations)
      t.end()
    })

    t.test('should create orchestrations array', t => {
      const ctx = {}
      const requests = []

      performLookupRequests(ctx, requests)
      t.ok(ctx.orchestrations)
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
            },
            allData: {
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          request: {
            headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
          }
        }

        try {
          await Promise.all(performLookupRequests(ctx, requests))
        } catch (error) {
          t.equal(ctx.orchestrations.length, 1)
          t.equal(ctx.state.allData.state.currentLookupNetworkError, true)
          t.match(
            error.message,
            /No response from lookup '1233243'. connect ECONNREFUSED/
          )
          t.end()
        }
      }
    )

    t.test(
      'should throw error and create orchestration when one lookup fails( server responds with a error)',
      async t => {
        const url = 'http://localhost:5000'
        const method = 'GET'
        const id = '1233243'

        const responseError = {
          message: 'Bad request'
        }
        nock(url).get('/patient').reply(400, responseError)

        const requests = [
          {
            config: {
              url: `${url}/patient`,
              method: method
            },
            id: id
          }
        ]

        const ctx = {
          state: {
            metaData: {
              requests: {}
            },
            allData: {
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          request: {
            headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
          }
        }

        try {
          await Promise.all(performLookupRequests(ctx, requests))
        } catch (error) {
          t.equal(ctx.orchestrations.length, 1)
          t.equal(ctx.state.allData.state.currentLookupHttpStatus, 400)
          t.same(
            error.message,
            `Incorrect status code 400. {"message":"Bad request"}`
          )
          t.end()
        }
      }
    )

    t.test('should do lookups and create orchestrations', async t => {
      const url = 'http://localhost:4000/'

      nock(url)
        .matchHeader(OPENHIM_TRANSACTION_HEADER, '1232244')
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
          },
          allData: {
            timestamps: {
              lookupRequests: {}
            }
          }
        },
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
        }
      }

      await Promise.all(performLookupRequests(ctx, requests)).then(res => {
        t.same(res[0]['123'].data, 'Body')
        t.equal(ctx.state.allData.state.currentLookupHttpStatus, 200)
        t.equal(ctx.orchestrations.length, 1)
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
            metaData: {},
            allData: {
              timestamps: {
                lookupRequests: {}
              }
            }
          }
        }
        prepareLookupRequests(ctx)

        t.notOk(ctx.orchestrations)
        t.end()
      }
    )

    t.test('should throw error when lookup request fails', async t => {
      const url = 'http://localhost:4000/'

      const method = 'GET'

      const ctx = {
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '123'}
        },
        state: {
          allData: {
            timestamps: {
              lookupRequests: {}
            }
          },
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

      nock(url).get('/patient').times(2).reply(200, 'Body')

      const method = 'GET'

      const ctx = {
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '123'}
        },
        state: {
          allData: {
            timestamps: {
              lookupRequests: {}
            }
          },
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

      t.equal(ctx.orchestrations.length, 2)
      t.ok(ctx.state.allData.lookupRequests)
      t.same(ctx.state.allData.lookupRequests, {
        chrome: {
          data: 'Body',
          headers: {}
        },
        safari: {
          data: 'Body',
          headers: {}
        }
      })
      t.end()
    })
  })

  t.test('prepareResponseRequests', {autoend: true}, t => {
    t.test('should not do any orchestration if the mapping fails', async t => {
      const ctx = {
        state: {
          metaData: {
            requests: {}
          },
          allData: {
            constants: {},
            state: {},
            timestamps: {
              lookupRequests: {}
            }
          }
        }
      }

      await prepareResponseRequests(ctx)

      t.equal(ctx.orchestrations, undefined)
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          }
        }
        await prepareResponseRequests(ctx)

        t.equal(ctx.orchestrations)
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          request: {}
        }

        await prepareResponseRequests(ctx)

        t.equal(ctx.orchestrations, undefined)
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          body: {},
          request: {}
        }
        await prepareResponseRequests(ctx)

        t.equal(ctx.orchestrations.length, 0)
        t.end()
      }
    )

    t.test(
      'should send requests and record the orchestrations (to a server that is down)',
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          request: {
            headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
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

        t.equal(ctx.orchestrations.length, 2)
        t.match(ctx.orchestrations[0].error.message, /ECONNREFUSED/)
        t.end()
      }
    )

    t.test('should produce to a kafka topic', async t => {
      const id = '1233243'

      const ctx = {
        status: 200,
        state: {
          metaData: {
            requests: {
              response: [
                {
                  id: id,
                  kafkaProducerTopic: 'test',
                  config: {}
                }
              ]
            }
          },
          allData: {
            constants: {},
            state: {},
            timestamps: {
              lookupRequests: {}
            }
          }
        },
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
        },
        response: {
          headers: {}
        },
        body: {},
        set: (key, value) => {
          ctx.response.headers[key] = value
        }
      }

      const stub = sinon.stub(kafka, 'sendToKafka').resolves()
      await prepareResponseRequests(ctx)

      t.ok(stub.called)
      stub.restore()
      t.end()
    })

    t.test('should catch the error when sending to kafka fails', async t => {
      const id = '1233243'

      const ctx = {
        status: 200,
        state: {
          metaData: {
            requests: {
              response: [
                {
                  id: id,
                  kafkaProducerTopic: 'test',
                  config: {}
                }
              ]
            }
          },
          allData: {
            constants: {},
            state: {},
            timestamps: {
              lookupRequests: {}
            }
          }
        },
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
        },
        response: {
          headers: {}
        },
        body: {},
        set: (key, value) => {
          ctx.response.headers[key] = value
        }
      }

      const stub = sinon.stub(kafka, 'sendToKafka').rejects()
      await prepareResponseRequests(ctx)

      t.ok(stub.called)
      stub.restore()
      t.end()
    })

    t.test('should send requests and record the orchestrations', async t => {
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
                },
                {
                  config: {
                    url: `${url}patient?name=raze`,
                    method: method
                  },
                  id: 'Entity'
                }
              ]
            }
          },
          allData: {
            constants: {},
            state: {},
            timestamps: {
              lookupRequests: {}
            }
          }
        },
        request: {
          headers: {[OPENHIM_TRANSACTION_HEADER]: '1232244'}
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
        .matchHeader(OPENHIM_TRANSACTION_HEADER, '1232244')
        .put('/patient?name=raze')
        .times(2)
        .reply(200, response)

      await prepareResponseRequests(ctx)

      t.equal(ctx.orchestrations.length, 2)
      t.same(ctx.orchestrations[1].response.body, JSON.stringify(response))

      t.end()
    })

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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          },
          request: {
            headers: {}
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

        nock(url).put('/patient?name=raze').reply(200, response)

        await prepareResponseRequests(ctx)

        t.equal(ctx.orchestrations.length, 0)

        t.same(ctx.body, response)
        t.end()
      }
    )

    t.test('prepareLookupRequests', {autoend: true}, t => {
      t.test('should throw an error if any promise in the array fails', t => {
        t.plan(2)

        const performLookupRequestsStub = externalRequests.__set__(
          'performLookupRequests',
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx).catch(err => {
          performLookupRequestsStub()
          t.type(err, 'string')
          t.equal(err, 'Fail')
        })
      })

      t.test(
        'should add response data to the ctx when all promises resolve',
        t => {
          t.plan(1)

          const performLookupRequestsStub = externalRequests.__set__(
            'performLookupRequests',
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
              },
              allData: {
                constants: {},
                state: {},
                timestamps: {
                  lookupRequests: {}
                }
              }
            }
          }

          const prepareLookupRequests = externalRequests.__get__(
            'prepareLookupRequests'
          )

          prepareLookupRequests(ctx).then(() => {
            t.same(
              {test1: 'testA', test2: 'testB'},
              ctx.state.allData.lookupRequests
            )
            performLookupRequestsStub()
          })
        }
      )

      t.test(
        'should remove unnecessary openhim mediator response details when promises resolve',
        t => {
          t.plan(1)

          const performLookupRequestsStub = externalRequests.__set__(
            'performLookupRequests',
            () => [
              Promise.resolve({
                // The first request's details simulate the response from an OpenHIM Mediator
                fristReq: {
                  data: {
                    'x-mediator-urn': 'test',
                    response: {
                      // The response body will always be a string when it's an OpenHIM Mediator
                      body: JSON.stringify({test1: 'testA'})
                    },
                    orchestrations: []
                  }
                }
              }),
              Promise.resolve({secondReq: {data: {test2: 'testB'}}})
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
                      id: 'fristReq'
                      // first lookup request config - responds with success
                    },
                    {
                      id: 'secondReq'
                      // second lookup request config - responds with success
                    }
                  ]
                }
              },
              allData: {
                constants: {},
                state: {},
                timestamps: {
                  lookupRequests: {}
                }
              }
            }
          }

          const prepareLookupRequests = externalRequests.__get__(
            'prepareLookupRequests'
          )

          prepareLookupRequests(ctx).then(() => {
            // The mediator urn and orchestration data should be stripped from the response
            t.same(
              {
                fristReq: {data: {test1: 'testA'}},
                secondReq: {data: {test2: 'testB'}}
              },
              ctx.state.allData.lookupRequests
            )
            performLookupRequestsStub()
          })
        }
      )

      t.test(
        'should remove unnecessary openhim mediator response details in array mediator lookup requests',
        t => {
          t.plan(1)

          const performLookupRequestsStub = externalRequests.__set__(
            'performLookupRequests',
            () => [
              Promise.resolve({
                fristReq: [
                  {
                    data: {
                      'x-mediator-urn': 'test',
                      response: {
                        // The response body will always be a string when it's an OpenHIM Mediator
                        body: JSON.stringify({test1: 'testA'})
                      },
                      orchestrations: []
                    }
                  },
                  {
                    data: {
                      'x-mediator-urn': 'test',
                      response: {
                        // The response body will always be a string when it's an OpenHIM Mediator
                        body: JSON.stringify({test2: 'testB'})
                      },
                      orchestrations: []
                    }
                  }
                ]
              })
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
                      id: 'fristReq'
                      // first lookup request config - responds with success
                    }
                  ]
                }
              },
              allData: {
                constants: {},
                state: {},
                timestamps: {
                  lookupRequests: {}
                }
              }
            }
          }

          const prepareLookupRequests = externalRequests.__get__(
            'prepareLookupRequests'
          )

          prepareLookupRequests(ctx).then(() => {
            // The mediator urn and orchestration data should be stripped from the response
            t.same(
              {fristReq: [{data: {test1: 'testA'}}, {data: {test2: 'testB'}}]},
              ctx.state.allData.lookupRequests
            )
            performLookupRequestsStub()
          })
        }
      )

      t.test(
        'should return original mediator response data if mediator response body is not stringified JSON',
        t => {
          t.plan(1)

          const performLookupRequestsStub = externalRequests.__set__(
            'performLookupRequests',
            () => [
              Promise.resolve({
                // Unstructured String Response from Mediator
                fristReq: {
                  'x-mediator-urn': 'test',
                  response: {
                    // The response body will always be a string when it's an OpenHIM Mediator
                    body: 'Test String'
                  },
                  orchestrations: []
                }
              })
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
                      id: 'fristReq'
                      // first lookup request config - responds with success
                    }
                  ]
                }
              },
              allData: {
                constants: {},
                state: {},
                timestamps: {
                  lookupRequests: {}
                }
              }
            }
          }

          const prepareLookupRequests = externalRequests.__get__(
            'prepareLookupRequests'
          )

          prepareLookupRequests(ctx).then(() => {
            // The mediator urn and orchestration data should be stripped from the response
            t.same(
              {
                fristReq: {
                  'x-mediator-urn': 'test',
                  response: {
                    // The response body will always be a string when it's an OpenHIM Mediator
                    body: 'Test String'
                  },
                  orchestrations: []
                }
              },
              ctx.state.allData.lookupRequests
            )
            performLookupRequestsStub()
          })
        }
      )
    })

    t.test(
      'should not reach the request making function if there is no lookup config',
      t => {
        let called = false
        const performLookupRequestsStub = externalRequests.__set__({
          performLookupRequests: () => {
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
            },
            allData: {
              constants: {},
              state: {},
              timestamps: {
                lookupRequests: {}
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx)

        performLookupRequestsStub()
        t.equal(called, false, 'performLookupRequestsStub should not be called')
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
      t.notOk(requestConfig.data)
      t.notOk(requestConfig.params)
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
      t.equal(requestConfig.data, requestBody)
      t.end()
    })

    t.test('should the function for validating statuses', t => {
      const requestDetails = {
        config: {
          url: `localhost:8080`,
          method: 'GET'
        },
        allowedStatuses: [200, '3xx']
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
      t.ok(requestConfig.validateStatus)
      t.notOk(requestConfig.validateStatus(400))
      t.ok(requestConfig.validateStatus(300))
      t.end()
    })

    t.test('should add url to request config object', t => {
      const requestDetails = {
        config: {
          url: `localhost:8080`,
          method: 'GET'
        }
      }
      const requestBody = null
      const queryParams = null
      const requestUrl = 'localhost:8080/Patient'

      const requestConfig = prepareRequestConfig(
        requestDetails,
        requestBody,
        queryParams,
        requestUrl
      )
      t.equal(requestConfig.url, requestUrl)
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
      t.same(ctx.body[request.id], body)
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
      t.equal(ctx.body[request.id], undefined)
      t.end()
    })
  })

  t.test('setKoaResponseFromPrimary()', {autoend: true}, t => {
    t.test('should set the koa response', t => {
      const ctx = {
        body: {},
        headers: {},
        set: headers => {
          ctx.headers = headers
        }
      }
      const status = 200
      const headers = {'Content-Type': 'application/json'}
      const body = {message: 'success'}

      setKoaResponseBodyAndHeadersFromPrimary(ctx, status, headers, body)
      t.same(ctx.status, status)
      t.same(ctx.headers, headers)
      t.same(ctx.body, body)
      t.equal(ctx.hasPrimaryRequest, true)
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

      t.same(result.error, err)
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

        t.same(result.response.body, err.response.data)
        t.equal(
          ctx.routerResponseStatuses.includes('primaryReqFailError'),
          true
        )
        t.end()
      }
    )

    t.test(
      'should set the property "secondaryFailError" when response status is 500',
      t => {
        const ctx = {
          body: {}
        }
        const request = {
          primary: false
        }
        const err = {
          response: {
            data: {message: 'Internal Server Error'},
            status: 500
          }
        }

        handleRequestError(ctx, request, err)
        t.equal(ctx.routerResponseStatuses.includes('secondaryFailError'), true)
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

        t.same(result.response.body, err.response.data)
        t.equal(ctx.routerResponseStatuses.includes('primaryCompleted'), true)
        t.end()
      }
    )

    t.test(
      'should set the property "secondaryCompleted" on ctx when response status is not 2xx and 5xx',
      t => {
        const ctx = {
          body: {}
        }
        const request = {
          primary: false
        }
        const err = {
          response: {
            data: {message: 'Bad request'},
            status: 400
          }
        }

        const result = handleRequestError(ctx, request, err)

        t.same(result.response.body, err.response.data)
        t.equal(ctx.routerResponseStatuses.includes('secondaryCompleted'), true)
        t.end()
      }
    )
  })

  t.test('addRequestQueryParameters', {autoend: true}, t => {
    t.test('should create request query parameters', t => {
      const ctx = {
        state: {
          allData: {
            lookupRequests: {
              children: 4
            },
            state: {
              lastAddress: '1 1st street'
            },
            responseBody: {
              brother: 'test'
            },
            urlParams: {
              location: '12 street'
            },
            transforms: {
              building: 'Burj Kalifa',
              floor: 0,
              extension: '',
              moreInfo: null
            },
            constants: {
              multiplier: '2'
            },
            timestamps: {
              endpointStart: '2020-04-20T16:20.04.020Z'
            }
          }
        },
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
          query: {
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
            },
            lastAddress: {
              path: 'state.lastAddress'
            },
            children: {
              path: 'lookupRequests.children'
            },
            brother: {
              path: 'responseBody.brother'
            },
            location: {
              path: 'urlParams.location'
            },
            building: {
              path: 'transforms.building'
            },
            floor: {
              path: 'transforms.floor'
            },
            extension: {
              path: 'transforms.extension'
            },
            moreInfo: {
              path: 'transforms.moreInfo'
            },
            multiplier: {
              path: 'constants.multiplier'
            },
            time: {
              path: 'timestamps.endpointStart'
            }
          }
        }
      }

      const params = addRequestQueryParameters(ctx, request)

      t.equal(params.id, ctx.request.body.id)
      t.equal(params.place, ctx.request.body.place.address)
      t.equal(params.code, ctx.request.query.code)
      t.equal(params.status, ctx.request.body.status[1].rich.status[0].sp)
      t.equal(params.name, `${prefix + ctx.request.query.name + postfix}`)
      // Query params are strings therefore the digit will be converted
      t.equal(params.floor, ctx.state.allData.transforms.floor.toString())
      t.equal(
        params.children,
        ctx.state.allData.lookupRequests.children.toString()
      )
      t.equal(params.brother, ctx.state.allData.responseBody.brother)
      t.equal(params.lastAddress, ctx.state.allData.state.lastAddress)
      t.equal(params.location, ctx.state.allData.urlParams.location)
      t.equal(params.building, ctx.state.allData.transforms.building)
      t.equal(params.extension, ctx.state.allData.transforms.extension)
      t.equal(params.multiplier, ctx.state.allData.constants.multiplier)
      t.equal(params.time, ctx.state.allData.timestamps.endpointStart)
      t.notOk(params.moreInfo)
      t.end()
    })

    t.test('should throw when invalid param path specified', t => {
      const ctx = {}

      const request = {
        params: {
          id: {
            path: 'invalidPath.id'
          }
        }
      }

      try {
        addRequestQueryParameters(ctx, request)
      } catch (error) {
        t.equal(
          error.message,
          'Unsupported Query Parameter Extract Type: invalidPath'
        )
      }

      t.end()
    })
  })

  t.test('resolveRequestUrl', {autoend: true}, t => {
    t.test('should return the request url if there are no url params', t => {
      t.equal(
        resolveRequestUrl({}, {url: 'http://test.org'}),
        'http://test.org'
      )
      t.end()
    })

    t.test('should return the request url with url params replaced', t => {
      const url = resolveRequestUrl(
        {
          request: {
            body: {
              test1: 'params',
              test: {
                2: 'test'
              }
            }
          }
        },
        {
          url: 'http://test.org/url/:test1/are/fun/:test1/:test2/',
          params: {
            url: {
              test1: {path: 'payload.test1'},
              test2: {
                path: 'payload.test.2',
                prefix: 'to-',
                postfix: '-thoroughly'
              }
            }
          }
        }
      )
      t.equal(
        url,
        'http://test.org/url/params/are/fun/params/to-test-thoroughly/'
      )
      t.end()
    })

    t.test(
      'should return template value if parameter resolves to null or undefined',
      t => {
        const url = resolveRequestUrl(
          {
            request: {
              body: {
                test1: null,
                test: {
                  2: undefined
                }
              }
            }
          },
          {
            url: 'http://test.org/url/:test1/are/fun/:test1/:test2/',
            params: {
              url: {
                test1: {path: 'payload.test1'},
                test2: {
                  path: 'payload.test.2',
                  prefix: 'to-',
                  postfix: '-thoroughly'
                }
              }
            }
          }
        )
        t.equal(url, 'http://test.org/url/:test1/are/fun/:test1/:test2/')
        t.end()
      }
    )

    t.test('should return url with substituted in zero or empty quotes', t => {
      const url = resolveRequestUrl(
        {
          request: {
            body: {
              test1: '',
              test: {
                2: 0
              }
            }
          }
        },
        {
          url: 'http://test.org/url/:test1/are/fun/:test1/:test2/',
          params: {
            url: {
              test1: {path: 'payload.test1'},
              test2: {
                path: 'payload.test.2',
                prefix: 'to-',
                postfix: '-thoroughly'
              }
            }
          }
        }
      )
      t.equal(url, 'http://test.org/url//are/fun//to-0-thoroughly/')
      t.end()
    })
  })
})
