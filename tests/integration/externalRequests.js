'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const testMapperPort = 13006
const mockServerPort = 7755
process.env.MONGO_URL = 'mongodb://localhost:27017/externalRequestTest'

const {withTestMapperServer, withMockServer} = require('../utils')

tap.test(
  'ExternalRequestMiddleware',
  withTestMapperServer(
    testMapperPort,
    withMockServer(mockServerPort, async (t, server) => {
      t.test('requestMiddleware should perform lookupRequests', async t => {
        t.plan(3)
        const fhirPatient = {
          resourceType: 'Patient',
          gender: 'other'
        }
        const fhirObservation = {
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                code: '007',
                display: 'Secret Agent'
              }
            ]
          }
        }
        server.on('request', async (req, res) => {
          if (req.method === 'GET' && req.url === '/Patient') {
            t.pass()
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(fhirPatient))
            return
          }
          if (req.method === 'GET' && req.url === '/Observation') {
            t.pass()
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(fhirObservation))
            return
          }
          res.writeHead(404)
          res.end()
          return
        })

        const testEndpoint = {
          name: 'External Request Test Endpoint 1',
          endpoint: {
            pattern: '/externalRequestTest1'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            lookup: [
              {
                id: 'fhirPatient',
                config: {
                  method: 'get',
                  url: `http://localhost:${mockServerPort}/Patient`
                }
              },
              {
                id: 'fhirObservation',
                config: {
                  method: 'get',
                  url: `http://localhost:${mockServerPort}/Observation`
                }
              }
            ]
          },
          inputMapping: {
            'lookupRequests.fhirPatient.data': 'fhirPatient',
            'lookupRequests.fhirObservation.data': 'fhirObservation'
          }
        }

        await request(`http://localhost:${testMapperPort}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        // The mapper currently only accepts POSTs
        const requestData = {}

        await request(`http://localhost:${testMapperPort}`)
          .post('/externalRequestTest1')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(response => {
            t.deepEquals(response.body, {fhirPatient, fhirObservation})
          })
      })

      t.test(
        'requestMiddleware should perform lookupRequests (and send request body)',
        async t => {
          t.plan(4)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'other'
          }
          const fhirObservation = {
            resourceType: 'Observation',
            status: 'final',
            code: {
              coding: [
                {
                  code: '007',
                  display: 'Secret Agent'
                }
              ]
            }
          }

          const requestBody = {
            firstName: 'Palesao',
            middleName: 'Naadirah',
            surname: 'Van Wyk',
            patientId: '12345',
            dob: '1945-09-03'
          }

          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url === '/Patient') {
              req.on('data', chunk => {
                t.equals(chunk.toString(), JSON.stringify(requestBody))
              })
              t.pass()
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            if (req.method === 'GET' && req.url === '/Observation') {
              t.pass()
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirObservation))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 1 (send request body)',
            endpoint: {
              pattern: '/externalRequestTest1SendBody'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                },
                {
                  id: 'fhirObservation',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/Observation`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient',
              'lookupRequests.fhirObservation.data': 'fhirObservation'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest1SendBody')
            .send(requestBody)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {fhirPatient, fhirObservation})
            })
        }
      )

      t.test(
        "should populate the externalRequests' urls with url parameters sent in the request url path",
        async t => {
          t.plan(3)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'other'
          }
          const fhirObservation = {
            resourceType: 'Observation',
            status: 'final',
            code: {
              coding: [
                {
                  code: '007',
                  display: 'Secret Agent'
                }
              ]
            }
          }
          server.on('request', async (req, res) => {
            if (req.method === 'GET' && req.url === '/Patient/patient321') {
              t.pass()
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            if (
              req.method === 'GET' &&
              req.url === '/Observation/observation123'
            ) {
              t.pass()
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirObservation))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint - url Params test',
            endpoint: {
              pattern: '/externalRequestTest1/:patientId/:observationId'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/Patient/:patientId`,
                    params: {
                      url: {
                        patientId: {
                          path: 'urlParams.patientId'
                        },
                        observationId: {
                          path: 'urlParams.observationId'
                        }
                      }
                    }
                  }
                },
                {
                  id: 'fhirObservation',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/Observation/:observationId`,
                    params: {
                      url: {
                        patientId: {
                          path: 'urlParams.patientId'
                        },
                        observationId: {
                          path: 'urlParams.observationId'
                        }
                      }
                    }
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient',
              'lookupRequests.fhirObservation.data': 'fhirObservation'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          // The mapper currently only accepts POSTs
          const requestData = {}

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest1/patient321/observation123')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {fhirPatient, fhirObservation})
            })
        }
      )

      t.test('requestMiddleware should post response', async t => {
        t.plan(3)
        const fhirPatient = {
          resourceType: 'Patient',
          gender: 'unknown'
        }
        const fhirPatientResponse = {
          resourceType: 'Patient',
          id: '1135633',
          meta: {
            versionId: '1'
          },
          gender: 'unknown'
        }

        server.on('request', async (req, res) => {
          if (req.method === 'POST' && req.url === '/Patient') {
            t.pass(req.body, fhirPatient)
            res.writeHead(201, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(fhirPatientResponse))
            return
          }
          res.writeHead(404)
          res.end()
          return
        })

        const testEndpoint = {
          name: 'External Request Test Endpoint 2',
          endpoint: {
            pattern: '/externalRequestTest2'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            response: [
              {
                id: 'fhir-server',
                config: {
                  method: 'post',
                  url: `http://localhost:${mockServerPort}/Patient`
                },
                allowedStatuses: ['201']
              }
            ]
          },
          inputMapping: {
            requestBody: 'fhirPatient'
          }
        }

        await request(`http://localhost:${testMapperPort}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        // The mapper currently only accepts POSTs
        const requestData = fhirPatient

        await request(`http://localhost:${testMapperPort}`)
          .post('/externalRequestTest2')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(response => {
            t.equals(response.status, 201)
            t.deepEquals(response.body, fhirPatientResponse)
          })
      })

      t.test(
        'requestMiddleware should extract query params from requestBody and use them in a request',
        async t => {
          t.plan(3)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'unknown'
          }

          server.on('request', async (req, res) => {
            if (
              req.method === 'GET' &&
              req.url === '/fhir/Patient?id=Patient:12345'
            ) {
              t.pass()
              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 3',
            endpoint: {
              pattern: '/externalRequestTest3'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhir-server',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/fhir/Patient`,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    params: {
                      query: {
                        id: {
                          path: 'payload.patientId',
                          prefix: 'Patient:'
                        }
                      }
                    }
                  },
                  allowedStatuses: ['2xx']
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhir-server.data.resourceType': 'resourceType',
              'lookupRequests.fhir-server.data.gender': 'gender'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          // The mapper currently only accepts POSTs
          const requestData = {patientId: '12345'}

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest3')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 200)
              t.deepEquals(response.body, fhirPatient)
            })
        }
      )

      t.test('requestMiddleware should fail lookup request', async t => {
        t.plan(3)
        server.on('request', async (req, res) => {
          if (req.method === 'GET' && req.url === '/Patient') {
            t.pass()
            res.writeHead(418, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: `I'm a teapot`}))
            return
          }
          res.writeHead(404)
          res.end()
          return
        })

        const testEndpoint = {
          name: 'External Request Test Endpoint 4',
          endpoint: {
            pattern: '/externalRequestTest4'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            lookup: [
              {
                id: 'fhirPatient',
                config: {
                  method: 'get',
                  url: `http://localhost:${mockServerPort}/Patient`
                }
              }
            ]
          }
        }

        await request(`http://localhost:${testMapperPort}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        // The mapper currently only accepts POSTs
        const requestData = {}

        await request(`http://localhost:${testMapperPort}`)
          .post('/externalRequestTest4')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(response => {
            t.equals(response.status, 418)
            t.deepEquals(
              response.body.error,
              `Rejected Promise: Error: Incorrect status code 418. I'm a teapot`
            )
          })
      })

      t.test('requestMiddleware should fail response request', async t => {
        t.plan(3)
        server.on('request', async (req, res) => {
          if (req.method === 'POST' && req.url === '/Patient') {
            t.pass()
            res.writeHead(504, {'Content-Type': 'application/json'})
            res.end(JSON.stringify({message: 'Gateway Timeout'}))
            return
          }
          res.writeHead(404)
          res.end()
          return
        })

        const testEndpoint = {
          name: 'External Request Test Endpoint 5',
          endpoint: {
            pattern: '/externalRequestTest5'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          requests: {
            response: [
              {
                id: 'fhirPatient',
                config: {
                  method: 'post',
                  url: `http://localhost:${mockServerPort}/Patient`
                }
              }
            ]
          }
        }

        await request(`http://localhost:${testMapperPort}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
        // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
        // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
        await sleep(100)

        // The mapper currently only accepts POSTs
        const requestData = {
          resourceType: 'Patient',
          gender: 'unknown'
        }

        await request(`http://localhost:${testMapperPort}`)
          .post('/externalRequestTest5')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(response => {
            t.equals(response.status, 504)
            t.deepEquals(response.body.message, 'Gateway Timeout')
          })
      })

      t.test(
        'requestMiddleware should extract url params from requestBody and use them in a request',
        async t => {
          t.plan(3)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'unknown'
          }

          server.on('request', async (req, res) => {
            if (
              req.method === 'GET' &&
              req.url === '/fhir/Patient/pre12345post/_history'
            ) {
              t.pass()
              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 6',
            endpoint: {
              pattern: '/externalRequestTest6'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhir-server',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/fhir/Patient/:id/_history`,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    params: {
                      url: {
                        id: {
                          path: 'payload.patientId',
                          prefix: 'pre',
                          postfix: 'post'
                        }
                      }
                    }
                  },
                  allowedStatuses: ['2xx']
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhir-server.data.resourceType': 'resourceType',
              'lookupRequests.fhir-server.data.gender': 'gender'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {patientId: '12345'}

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest6')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 200)
              t.deepEquals(response.body, fhirPatient)
            })
        }
      )

      t.test(
        'requestMiddleware should return an orchestration including resolved url parameters',
        async t => {
          t.plan(5)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'unknown'
          }

          server.on('request', async (req, res) => {
            if (
              req.method === 'GET' &&
              req.url === '/fhir/Patient/pre12345post/_history'
            ) {
              t.pass()
              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 7',
            endpoint: {
              pattern: '/externalRequestTest7'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhir-server',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/fhir/Patient/:id/_history`,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    params: {
                      url: {
                        id: {
                          path: 'payload.patientId',
                          prefix: 'pre',
                          postfix: 'post'
                        }
                      }
                    }
                  },
                  allowedStatuses: ['2xx']
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhir-server.data.resourceType': 'resourceType',
              'lookupRequests.fhir-server.data.gender': 'gender'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {patientId: '12345'}

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest7')
            .send(requestData)
            .set('Content-Type', 'application/json')
            // forces a mediator response
            .set('x-openhim-transactionid', '123')
            .expect(response => {
              t.equals(response.status, 200)
              t.equals(
                response.body['x-mediator-urn'],
                'urn:mediator:generic_mapper'
              )
              t.equals(response.body.status, 'Successful')
              t.equals(
                response.body.orchestrations[0].request.path,
                '/fhir/Patient/pre12345post/_history'
              )
            })
        }
      )

      t.test(
        'requestMiddleware should perform forEach lookupRequests',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url === '/Patient') {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 8',
            endpoint: {
              pattern: '/externalRequestTest8'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  forEach: {
                    items: 'payload.test'
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [{id: 1}, {id: 2}, {id: 3}]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest8')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {
                fhirPatient: [{id: 1}, {id: 2}, {id: 3}]
              })
            })
        }
      )

      t.test(
        'requestMiddleware should perform forEach lookupRequests with concurrency',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url === '/Patient') {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 9',
            endpoint: {
              pattern: '/externalRequestTest9'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  forEach: {
                    items: 'payload.test',
                    concurrency: 3
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [
              {id: 1},
              {id: 2},
              {id: 3},
              {id: 4},
              {id: 5},
              {id: 6},
              {id: 7},
              {id: 8},
              {id: 9},
              {id: 10}
            ]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest9')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {
                fhirPatient: [
                  {id: 1},
                  {id: 2},
                  {id: 3},
                  {id: 4},
                  {id: 5},
                  {id: 6},
                  {id: 7},
                  {id: 8},
                  {id: 9},
                  {id: 10}
                ]
              })
            })
        }
      )

      t.test(
        'requestMiddleware return 400 when forEach lookupRequests have invalid options',
        async t => {
          t.plan(2)

          const testEndpoint = {
            name: 'External Request Test Endpoint 10',
            endpoint: {
              pattern: '/externalRequestTest10'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  forEach: {
                    invalid: ''
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [{id: 1}, {id: 2}, {id: 3}]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest10')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 400)
              t.deepEquals(
                response.body.error,
                'Rejected Promise: Error: forEach.items property must exist for forEach lookups'
              )
            })
        }
      )

      t.test(
        'requestMiddleware return 400 when forEach lookupRequests have invalid options',
        async t => {
          t.plan(2)

          const testEndpoint = {
            name: 'External Request Test Endpoint 11',
            endpoint: {
              pattern: '/externalRequestTest11'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  forEach: {
                    items: 'payload.test'
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: {not: 'array'}
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest11')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 400)
              t.deepEquals(
                response.body.error,
                "Rejected Promise: Error: forEach.items could not be found at the specified path or the resolved value isn't an array"
              )
            })
        }
      )

      t.test(
        'requestMiddleware should allow forEach requests to use the item state as a parameter',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url.startsWith('/Patient/')) {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 12',
            endpoint: {
              pattern: '/externalRequestTest12'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  forwardExistingRequestBody: true,
                  forEach: {
                    items: 'payload.test'
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient/:id`,
                    params: {
                      url: {
                        id: {
                          path: 'item.id'
                        }
                      }
                    }
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [{id: 111}, {id: 222}, {id: 333}]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest12')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {
                fhirPatient: [{id: 111}, {id: 222}, {id: 333}]
              })
            })
        }
      )

      t.test(
        'requestMiddleware return 400 when forEach responseRequests have invalid options',
        async t => {
          t.plan(2)

          const testEndpoint = {
            name: 'External Request Test Endpoint 13',
            endpoint: {
              pattern: '/externalRequestTest13'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              response: [
                {
                  id: 'fhirPatient',
                  forEach: {
                    invalid: ''
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [{id: 1}, {id: 2}, {id: 3}]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest13')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 400)
              t.deepEquals(
                response.body.error,
                'forEach.items property must exist for forEach response'
              )
            })
        }
      )

      t.test(
        'requestMiddleware return 400 when forEach responseRequests have invalid options',
        async t => {
          t.plan(2)

          const testEndpoint = {
            name: 'External Request Test Endpoint 15',
            endpoint: {
              pattern: '/externalRequestTest15'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              response: [
                {
                  id: 'fhirPatient',
                  forEach: {
                    items: 'payload.test'
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: {not: 'array'}
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest15')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.equals(response.status, 400)
              t.deepEquals(
                response.body.error,
                "Rejected Promise: Error: forEach.items could not be found at the specified path or the resolved value isn't an array"
              )
            })
        }
      )

      t.test(
        'requestMiddleware should allow forEach requests to use the item state as a parameter',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url.startsWith('/Patient/')) {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 14',
            endpoint: {
              pattern: '/externalRequestTest14'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              response: [
                {
                  id: 'fhirPatient',
                  primary: true,
                  forEach: {
                    items: 'payload.test'
                  },
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient/:id`,
                    params: {
                      url: {
                        id: {
                          path: 'item.id'
                        }
                      }
                    }
                  }
                }
              ]
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            test: [{id: 111}, {id: 222}, {id: 333}]
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest14')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {
                fhirPatient: [{id: 111}, {id: 222}, {id: 333}]
              })
            })
        }
      )

      t.test(
        'requestMiddleware should send successful response request',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url.startsWith('/Patient/')) {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 16',
            endpoint: {
              pattern: '/externalRequestTest16'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              response: [
                {
                  id: 'fhirPatient',
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient/:id`,
                    params: {
                      url: {
                        id: {
                          path: 'payload.id'
                        }
                      }
                    }
                  }
                }
              ]
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            id: 111
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest16')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {id: 111})
            })
        }
      )

      t.test(
        'requestMiddleware should send multiple successful (non-array) response requests',
        async t => {
          t.plan(1)
          server.on('request', async (req, res) => {
            if (req.method === 'POST' && req.url.startsWith('/Patient/')) {
              res.writeHead(200, {'Content-Type': 'application/json'})
              req.pipe(res)
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 17',
            endpoint: {
              pattern: '/externalRequestTest17'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              response: [
                {
                  id: 'fhirPatient-1',
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient/:id`,
                    params: {
                      url: {
                        id: {
                          path: 'payload.id'
                        }
                      }
                    }
                  }
                },
                {
                  id: 'fhirPatient-2',
                  config: {
                    method: 'post',
                    url: `http://localhost:${mockServerPort}/Patient/:id`,
                    params: {
                      url: {
                        id: {
                          path: 'payload.id'
                        }
                      }
                    }
                  }
                }
              ]
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          const requestData = {
            id: 111
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/externalRequestTest17')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .expect(response => {
              t.deepEquals(response.body, {
                'fhirPatient-1': {id: 111},
                'fhirPatient-2': {id: 111}
              })
            })
        }
      )

      t.test(
        'requestMiddleware should retrieve data from response and request headers',
        async t => {
          t.plan(2)
          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'other'
          }
          const client_id = '12344455'
          const requesting_client = '233333'

          server.on('request', async (req, res) => {
            if (req.method === 'GET' && req.url === '/Patient') {
              t.pass()
              res.writeHead(200, {
                'Content-Type': 'application/json',
                client_id
              })
              res.end(JSON.stringify(fhirPatient))
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'External Request Test Endpoint 18',
            endpoint: {
              pattern: '/externalRequestTest18'
            },
            transformation: {
              input: 'JSON',
              output: 'JSON'
            },
            requests: {
              lookup: [
                {
                  id: 'fhirPatient',
                  config: {
                    method: 'get',
                    url: `http://localhost:${mockServerPort}/Patient`
                  }
                }
              ]
            },
            inputMapping: {
              'lookupRequests.fhirPatient.data': 'fhirPatient',
              'lookupRequests.fhirPatient.headers.client_id': 'client_id',
              'requestHeaders.requesting_client': 'requesting_client'
            }
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          // The mongoDB endpoint collection change listeners may take a few milliseconds to update the endpoint cache.
          // This wouldn't be a problem in the normal use case as a user would not create an endpoint and
          // immediately start posting to it within a few milliseconds. Therefore this timeout here should be fine...
          await sleep(100)

          await request(`http://localhost:${testMapperPort}`)
            .get('/externalRequestTest18')
            .set('Content-Type', 'application/json')
            .set('requesting_client', requesting_client)
            .expect(response => {
              t.deepEquals(
                response.body,
                Object.assign({}, {fhirPatient, requesting_client, client_id})
              )
            })
        }
      )
    })
  )
)
