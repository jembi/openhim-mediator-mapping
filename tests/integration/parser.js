'use strict'

const request = require('supertest')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const port = 13004
process.env.MONGO_URL = 'mongodb://localhost:27017/parserTest'

const {withTestMapperServer} = require('../utils')

tap.test(
  'ParserMiddleware',
  withTestMapperServer(port, async t => {
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
          },
          inputValidation: {
            type: 'object',
            properties: {
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                },
                required: ['name']
              }
            },
            required: ['requestBody']
          },
          inputMapping: {
            'requestBody.name': 'test.name'
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        await sleep(1000)

        const requestData = '<xml><name>Parser</name></xml>'

        await request(`http://localhost:${port}`)
          .post('/parserTest1')
          .send(requestData)
          .set('Content-Type', 'application/xml')
          .expect(200)
          .then(response => {
            t.equals(
              response.text,
              [
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                '<test>',
                '  <name>Parser</name>',
                '</test>'
              ].join('\n')
            )
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
          inputValidation: {
            type: 'object',
            properties: {
              lookupRequests: {
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
              },
              requestBody: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                },
                required: ['name']
              }
            },
            required: ['requestBody']
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

    t.test('parseBodyMiddleware should fail with invalid XML', async t => {
      const testEndpoint = {
        name: 'Parser Test Endpoint Bad XML',
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

      await sleep(1000)

      const requestData = 'Nonsense XML'

      await request(`http://localhost:${port}`)
        .post('/parserTest1')
        .send(requestData)
        .set('Content-Type', 'application/xml')
        .set('x-openhim-transactionid', 'requestUUID')
        .expect(response => {
          t.equals(response.status, 400)
          t.equals(
            response.text,
            [
              '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
              '<error>Parser Test Endpoint XML -&gt; XML (requestUUID): Parsing incoming body failed: Bad Request</error>'
            ].join('\n')
          )
        })

      t.end()
    })
  })
)
