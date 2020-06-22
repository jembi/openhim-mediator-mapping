'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const port = 13005
process.env.MONGO_URL = 'mongodb://localhost:27017/parserTest'

const {OPENHIM_TRANSACTION_HEADER} = require('../../src/constants')
const {withTestMapperServer} = require('../utils')

tap.test(
  'ParserMiddleware',
  withTestMapperServer(port, async t => {
    t.test(
      'parser middleware for endpoint creation and update should return error when data sent through is not valid json',
      async t => {
        const invalidJson = 'Body'

        const result = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(invalidJson)
          .set('Content-Type', 'application/json')
          .expect(400)

        t.match(result.body.error, /Parsing incoming request body failed/)
      }
    )

    t.test(
      'parseBodyMiddleware should accept XML content input and output XML',
      async t => {
        const testEndpoint = {
          name: 'Parser Test Endpoint XML -> XML',
          endpoint: {
            pattern: '/parserTest1'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
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
        await sleep(1000)

        const requestData = '<xml><name>Parser</name></xml>'

        await request(`http://localhost:${port}`)
          .post('/parserTest1')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .expect(200)
          .then(response => {
            t.match(response.text, /<name>Parser<\/name>/)
          })

        t.end()
      }
    )

    t.test(
      'parseBodyMiddleware should accept XML requestBody input\
       as well as JSON input from lookupRequest and output JSON',
      async t => {
        const testEndpoint = {
          name: 'Parser Test Endpoint XML + JSON -> JSON',
          endpoint: {
            pattern: '/parserTest2'
          },
          transformation: {
            input: 'XML',
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
            'requestBody.name': 'test.name',
            'lookupRequests.checkTestServerUp.milliseconds': 'test.duration'
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
        await sleep(1000)

        const requestData = '<xml><name>Parser</name></xml>'

        await request(`http://localhost:${port}`)
          .post('/parserTest2')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .set('Accept', 'application/json')
          .expect(200)
          .then(response => {
            t.equals(response.body.test.name, 'Parser')
            t.equals(typeof response.body.test.duration, 'number')
          })

        t.end()
      }
    )

    t.test(
      'parseBodyMiddleware should fail with invalid XML and output XML',
      async t => {
        const testEndpoint = {
          name: 'Parser Test Endpoint Bad XML output XML',
          endpoint: {
            pattern: '/parserTest3'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
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
        await sleep(1000)

        const requestData = 'Nonsense XML'

        await request(`http://localhost:${port}`)
          .post('/parserTest3')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .set(OPENHIM_TRANSACTION_HEADER, 'requestUUID')
          .expect(response => {
            t.equals(response.status, 400)
            t.equals(
              response.body.response.body,
              '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<error>Parser Test Endpoint Bad XML output XML (requestUUID): Parsing incoming body failed: Bad Request</error>'
            )
          })

        t.end()
      }
    )

    t.test(
      'parseBodyMiddleware should fail with invalid XML and output JSON',
      async t => {
        const testEndpoint = {
          name: 'Parser Test Endpoint Bad XML output JSON',
          endpoint: {
            pattern: '/parserTest4'
          },
          transformation: {
            input: 'XML',
            output: 'JSON'
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
        await sleep(1000)

        const requestData = 'Nonsense XML'

        await request(`http://localhost:${port}`)
          .post('/parserTest4')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .set(OPENHIM_TRANSACTION_HEADER, 'requestUUID')
          .expect(response => {
            t.equals(response.status, 400)
            t.deepEqual(JSON.parse(response.body.response.body), {
              error:
                'Parser Test Endpoint Bad XML output JSON (requestUUID): Parsing incoming body failed: Bad Request'
            })
          })

        t.end()
      }
    )
  })
)
