'use strict'

const request = require('supertest')
const tap = require('tap')

const port = 13003

const {withTestMapperServer, waitForURLReachable} = require('../utils')

tap.test(
  'ValidationMiddleware',
  withTestMapperServer(port, async t => {
    t.test(
      'validateBodyMiddleware should validate lookupRequests and requestBody data',
      async t => {
        const testEndpoint = {
          name: 'Test Endpoint',
          endpoint: {
            pattern: '/validationTest'
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
            required: ['lookupRequests', 'requestBody']
          }
        }

        await request('http://localhost:13003')
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        // The new endpoint may take a few milliseconds to trigger a cache update.
        // If the read endpoint comes back positive then the cache should be updated and we can safely post.
        await waitForURLReachable(
          `http://localhost:13003/endpoints?name=Test Endpoint`,
          500,
          5
        ).catch(error => {
          t.fail(`Should not error. Caused by: ${error.message}`)
        })

        const requestData = {
          name: 'Test'
        }

        await request('http://localhost:13003')
          .post('/validationTest')
          .send(requestData)
          .set('Content-Type', 'application/json')
          .expect(200)

        t.end()
      }
    )
  })
)
