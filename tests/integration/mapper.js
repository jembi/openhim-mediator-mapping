'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const port = 13004
process.env.MONGO_URL = 'mongodb://localhost:27017/mappingTest'

const {OPENHIM_TRANSACTION_HEADER} = require('../../src/constants')
const {withTestMapperServer} = require('../utils')

tap.test(
  'Mapping Middleware',
  withTestMapperServer(port, async t => {
    t.test(
      'should return object sent in request when no mapping schema is defined',
      async t => {
        const testEndpoint = {
          name: 'Mapping Test Endpoint',
          endpoint: {
            pattern: '/mappingTest'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {},
          inputValidation: {
            type: 'object',
            properties: {
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  surname: {
                    type: 'string'
                  },
                  id: {
                    type: 'string'
                  }
                },
                required: ['name', 'id']
              }
            },
            required: ['requestBody']
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        const requestData = {
          name: 'Taylor',
          surname: 'Ross',
          id: '12334'
        }

        const result = await request(`http://localhost:${port}`)
          .post('/mappingTest')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(200)

        t.deepEqual(result.body, requestData)
        t.end()
      }
    )

    t.test(
      'should return object sent in request and lookups done when no mapping schema is defined',
      async t => {
        const testEndpoint = {
          name: 'Mapping Test Endpoint 1',
          endpoint: {
            pattern: '/mappingTest1'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            lookup: [
              {
                id: 'checkTestServerUp',
                config: {
                  method: 'get',
                  url: `http://localhost:${port}/uptime`
                }
              }
            ]
          },
          inputValidation: {
            type: 'object',
            properties: {
              lookupRequests: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      checkTestServerUp: {
                        type: 'object',
                        properties: {
                          milliseconds: {
                            type: 'number'
                          }
                        },
                        required: ['milliseconds']
                      }
                    }
                  }
                },
                required: ['checkTestServerUp']
              },
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  surname: {
                    type: 'string'
                  },
                  id: {
                    type: 'string'
                  }
                },
                required: ['name', 'id']
              }
            },
            required: ['requestBody', 'lookupRequests']
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        const requestData = {
          name: 'Taylor',
          surname: 'Ross',
          id: '12334'
        }

        const result = await request(`http://localhost:${port}`)
          .post('/mappingTest1')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(200)

        t.deepEqual(result.body.requestBody, requestData)
        t.ok(result.body.lookupRequests)
        t.end()
      }
    )

    t.test('should return error when mapping fails', async t => {
      const testEndpoint = {
        name: 'Mapping Test Endpoint (failure)',
        endpoint: {
          pattern: '/mappingTestFail'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        requests: {
          lookup: [
            {
              id: 'checkTestServerUp',
              config: {
                method: 'get',
                url: `http://localhost:${port}/uptime`
              }
            }
          ]
        },
        inputMapping: {
          data: {
            key: 'key',
            transform: {
              function: 'inValidFunction' // Function does not exist and this will cause mapping to fail
            }
          }
        },
        inputValidation: {
          type: 'object',
          properties: {
            lookupRequests: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    checkTestServerUp: {
                      type: 'object',
                      properties: {
                        milliseconds: {
                          type: 'number'
                        }
                      },
                      required: ['milliseconds']
                    }
                  },
                  required: ['checkTestServerUp']
                }
              }
            },
            requestBody: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                surname: {
                  type: 'string'
                },
                id: {
                  type: 'string'
                }
              },
              required: ['name', 'id']
            }
          },
          required: ['requestBody', 'lookupRequests']
        }
      }

      await request(`http://localhost:${port}`)
        .post('/endpoints')
        .send(testEndpoint)
        .set('Content-Type', 'application/json')
        .expect(201)

      // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
      // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
      // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
      await sleep(100)

      const requestData = {
        name: 'Taylor',
        surname: 'Ross',
        id: '12334'
      }

      const result = await request(`http://localhost:${port}`)
        .post('/mappingTestFail')
        .send(requestData)
        .set('Content-Type', 'application/json')
        .expect(500)

      t.deepEqual(result.body, {
        error:
          'Input transform error: Object mapping schema invalid: No function exists for key: inValidFunction'
      })
      t.end()
    })

    t.test('should do the mapping', async t => {
      const testEndpoint = {
        name: 'Mapping Test Endpoint (success)',
        endpoint: {
          pattern: '/mappingTestSuccess'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        requests: {
          lookup: [
            {
              id: 'checkTestServerUp',
              config: {
                method: 'get',
                url: `http://localhost:${port}/uptime`
              }
            }
          ]
        },
        inputMapping: {
          'lookupRequests.checkTestServerUp.data': 'uptime',
          'requestBody.name': 'firstName',
          'requestBody.surname': 'lastName'
        },
        inputValidation: {
          type: 'object',
          properties: {
            lookupRequests: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    checkTestServerUp: {
                      type: 'object',
                      properties: {
                        milliseconds: {
                          type: 'number'
                        }
                      },
                      required: ['milliseconds']
                    }
                  },
                  required: ['checkTestServerUp']
                }
              }
            },
            requestBody: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                surname: {
                  type: 'string'
                },
                id: {
                  type: 'string'
                }
              },
              required: ['name', 'id']
            }
          },
          required: ['requestBody', 'lookupRequests']
        }
      }

      await request(`http://localhost:${port}`)
        .post('/endpoints')
        .send(testEndpoint)
        .set('Content-Type', 'application/json')
        .expect(201)

      // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
      // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
      // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
      await sleep(100)

      const requestData = {
        name: 'Taylor',
        surname: 'Ross',
        id: '12334'
      }

      const result = await request(`http://localhost:${port}`)
        .post('/mappingTestSuccess')
        .send(requestData)
        .set('Content-Type', 'application/json')
        .expect(200)

      t.deepEqual(result.body.firstName, requestData.name)
      t.deepEqual(result.body.lastName, requestData.surname)
      t.ok(result.body.uptime)
      t.end()
    })

    t.test(
      'should do the mapping and record mapping orchestration',
      async t => {
        const testEndpoint = {
          name: 'Mapping Test Endpoint 1 (success)',
          endpoint: {
            pattern: '/mappingTestSuccess1'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            lookup: [
              {
                id: 'checkTestServerUp',
                config: {
                  method: 'get',
                  url: `http://localhost:${port}/uptime`
                }
              }
            ]
          },
          inputMapping: {
            'lookupRequests.checkTestServerUp.data': 'uptime',
            'requestBody.name': 'firstName',
            'requestBody.surname': 'lastName'
          },
          inputValidation: {
            type: 'object',
            properties: {
              lookupRequests: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          checkTestServerUp: {
                            type: 'object',
                            properties: {
                              milliseconds: {
                                type: 'number'
                              }
                            },
                            required: ['milliseconds']
                          }
                        },
                        required: ['checkTestServerUp']
                      }
                    }
                  }
                }
              },
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  surname: {
                    type: 'string'
                  },
                  id: {
                    type: 'string'
                  }
                },
                required: ['name', 'id']
              }
            },
            required: ['requestBody', 'lookupRequests']
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        const requestData = {
          name: 'Taylor',
          surname: 'Ross',
          id: '12334'
        }

        let result = await request(`http://localhost:${port}`)
          .post('/mappingTestSuccess1')
          .send(requestData)
          .set(OPENHIM_TRANSACTION_HEADER, '1233333122')
          .expect(200)

        t.ok(result.body['x-mediator-urn'])
        t.equals(result.body.status, 'Successful')
        t.equal(result.body.orchestrations.length, 3)
        t.equal(
          result.body.orchestrations[1].name,
          'Endpoint Validation: Mapping Test Endpoint 1 (success)'
        )
        t.equal(
          result.body.orchestrations[2].name,
          'Endpoint Mapping: Mapping Test Endpoint 1 (success)'
        )
        t.end()
      }
    )
  })
)
