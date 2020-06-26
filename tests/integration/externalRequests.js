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
            'lookupRequests.fhirPatient': 'fhirPatient',
            'lookupRequests.fhirObservation': 'fhirObservation'
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
        await sleep(1000)

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
              'lookupRequests.fhirPatient': 'fhirPatient',
              'lookupRequests.fhirObservation': 'fhirObservation'
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
          await sleep(1000)

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
        await sleep(1000)

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
              'lookupRequests.fhir-server.resourceType': 'resourceType',
              'lookupRequests.fhir-server.gender': 'gender'
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
          await sleep(1000)

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
        await sleep(1000)

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
        await sleep(1000)

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
              'lookupRequests.fhir-server.resourceType': 'resourceType',
              'lookupRequests.fhir-server.gender': 'gender'
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
          await sleep(1000)

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
    })
  )
)
