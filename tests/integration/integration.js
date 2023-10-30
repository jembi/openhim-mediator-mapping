'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const testMapperPort = 13007
const mockServerPort = 7756
process.env.MONGO_URL = 'mongodb://localhost:27017/integrationTest'

const {withTestMapperServer, withMockServer} = require('../utils')
const {OPENHIM_TRANSACTION_HEADER} = require('../../src/constants')

tap.test(
  'Integration Full Flow',
  withTestMapperServer(
    testMapperPort,
    withMockServer(mockServerPort, async (t, server) => {
      t.test(
        'should accept JSON input, lookup data using query param, validate and \
        transform, then map and send response to external service and finally outputting XML response',
        async t => {
          t.plan(5)

          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'unknown'
          }

          server.on('request', async (req, res) => {
            if (
              req.method === 'GET' &&
              req.url === '/fhir/Patient?id=Test:12345'
            ) {
              t.pass()
              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            if (req.method == 'POST' && req.url === '/api') {
              req.on('data', chunk => {
                t.equal(
                  chunk.toString(),
                  `{"sex":"U","age":${Math.floor(
                    (Date.now() - new Date('1945-09-03')) / 31556952000
                  )},"names":["Palesa","Naadirah"],"familyName":"Van Wyk","nationality":"South Africa"}`
                )
              })

              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end()
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'Integration Test Endpoint 1',
            endpoint: {
              pattern: '/integrationTest1'
            },
            transformation: {
              input: 'JSON',
              output: 'XML'
            },
            constants: {
              nationality: 'South Africa'
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
                          prefix: 'Test:'
                        }
                      }
                    }
                  },
                  allowedStatuses: ['2xx']
                }
              ],
              response: {
                id: 'MPI',
                config: {
                  method: 'post',
                  url: `http://localhost:${mockServerPort}/api`,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              }
            },
            inputValidation: {
              type: 'object',
              properties: {
                lookupRequests: {
                  type: 'object',
                  properties: {
                    'fhir-server': {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            gender: {
                              type: 'string',
                              enum: ['female', 'unknown']
                            },
                            resourceType: {
                              type: 'string'
                            }
                          },
                          required: ['gender']
                        }
                      }
                    }
                  }
                },
                requestBody: {
                  type: 'object',
                  properties: {
                    firstName: {
                      type: 'string'
                    },
                    middleName: {
                      type: 'string'
                    },
                    surname: {
                      type: 'string'
                    },
                    patientId: {
                      type: 'string'
                    },
                    dob: {
                      type: 'string'
                    }
                  },
                  required: ['firstName', 'surname', 'patientId', 'dob']
                }
              }
            },
            inputTransforms: {
              age: '$floor( ( $toMillis( $now() ) - $toMillis( requestBody.dob ) ) / 31556952000 )'
            },
            inputMapping: {
              'lookupRequests.fhir-server.data.gender': {
                key: 'sex',
                transform: {
                  function: 'mapCodes',
                  parameters: {
                    female: 'F',
                    male: 'M',
                    other: 'O',
                    unknown: 'U'
                  }
                }
              },
              'transforms.age': 'age',
              'requestBody.firstName': 'names[]',
              'requestBody.middleName': 'names[]',
              'requestBody.surname': 'familyName',
              'constants.nationality': 'nationality'
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
            firstName: 'Palesa',
            middleName: 'Naadirah',
            surname: 'Van Wyk',
            patientId: '12345',
            dob: '1945-09-03'
          }

          await request(`http://localhost:${testMapperPort}`)
            .post('/integrationTest1')
            .send(requestData)
            .set('Content-Type', 'application/json')
            .set(OPENHIM_TRANSACTION_HEADER, 'requestUUID')
            .expect(response => {
              t.equal(
                response.body.response.body,
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<root/>'
              )
              t.equal(response.body.orchestrations.length, 5)
              t.equal(response.status, 201)
            })
        }
      )

      t.test(
        'should lookup data using query param, validate and \
        transform, then map and send response to external service and finally outputting XML response using a get request',
        async t => {
          t.plan(5)

          const fhirPatient = {
            resourceType: 'Patient',
            gender: 'unknown'
          }

          server.on('request', async (req, res) => {
            if (req.method === 'GET' && req.url === '/fhir/Patient') {
              t.pass()
              res.writeHead(200, {'Content-Type': 'application/json'})
              res.end(JSON.stringify(fhirPatient))
              return
            }
            if (req.method == 'POST' && req.url === '/api') {
              req.on('data', chunk => {
                t.equal(
                  chunk.toString(),
                  '{"sex":"U","nationality":"South Africa"}'
                )
              })

              res.writeHead(201, {'Content-Type': 'application/json'})
              res.end()
              return
            }
            res.writeHead(404)
            res.end()
            return
          })

          const testEndpoint = {
            name: 'Integration Test Endpoint 2',
            endpoint: {
              pattern: '/integrationTest2'
            },
            transformation: {
              input: 'JSON',
              output: 'XML'
            },
            constants: {
              nationality: 'South Africa'
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
                    }
                  },
                  allowedStatuses: ['2xx']
                }
              ],
              response: {
                id: 'MPI',
                config: {
                  method: 'post',
                  url: `http://localhost:${mockServerPort}/api`,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              }
            },
            inputValidation: {
              type: 'object',
              properties: {
                lookupRequests: {
                  type: 'object',
                  properties: {
                    'fhir-server': {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            gender: {
                              type: 'string',
                              enum: ['male', 'female', 'other', 'unknown']
                            },
                            resourceType: {
                              type: 'string'
                            }
                          },
                          required: ['gender']
                        }
                      }
                    }
                  }
                }
              }
            },
            inputMapping: {
              'lookupRequests.fhir-server.data.gender': {
                key: 'sex',
                transform: {
                  function: 'mapCodes',
                  parameters: {
                    female: 'F',
                    male: 'M',
                    other: 'O',
                    unknown: 'U'
                  }
                }
              },
              'constants.nationality': 'nationality'
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
            .get('/integrationTest2')
            .set(OPENHIM_TRANSACTION_HEADER, 'requestUUID')
            .expect(response => {
              t.equal(
                response.body.response.body,
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<root/>'
              )
              t.equal(response.body.orchestrations.length, 5)
              t.equal(response.status, 201)
            })
        }
      )

      t.test('Match on pattern that has url parameters', async t => {
        const testEndpoint = {
          name: 'Test Endpoints with url parameters',
          endpoint: {
            pattern: '/patient/:code/orgUnit/:id'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
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

        const requestData = '<xml><name>Parser</name></xml>'
        // should fail regex will not match
        await request(`http://localhost:${testMapperPort}`)
          .post('/patient/12')
          .set('Content-Type', 'application/xml')
          .send(requestData)
          .expect(404)

        // should fail regex will not match
        await request(`http://localhost:${testMapperPort}`)
          .post('/patient/1233/orgUnit/')
          .set('Content-Type', 'application/xml')
          .send(requestData)
          .expect(404)

        await request(`http://localhost:${testMapperPort}`)
          .post('/patient/1233/orgUnit/2334')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .expect(200)
          .then(response => {
            t.match(response.text, /<name>Parser<\/name>/)
          })

        t.end()
      })
    })
  )
)
