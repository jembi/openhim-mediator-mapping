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
        const fhirPatient = {
          resourceType: 'Patient',
          id: 'randomUUID'
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
          if (req.method === 'GET' && req.url === '/patient') {
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(fhirPatient))
            return
          }
          if (req.method === 'GET' && req.url === '/observation') {
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(fhirObservation))
            return
          }
          res.writeHead(404)
          res.end()
        })

        const testEndpoint = {
          name: 'Test Endpoint',
          endpoint: {
            pattern: '/externalRequestTest'
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
                  url: `http://localhost:${mockServerPort}/patient`
                }
              },
              {
                id: 'fhirObservation',
                config: {
                  method: 'get',
                  url: `http://localhost:${mockServerPort}/observation`
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
          .post('/externalRequestTest')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(response => {
            t.deepEquals(response.body, {fhirPatient, fhirObservation})
          })

        t.end()
      })
    })
  )
)
