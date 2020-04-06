'use strict'

const http = require('http')
const url = require('url')
const db = require('../src/db')
const config = require('../src/config').getConfig()

const port = '3444'
const testEndpointContent = {
  name: 'IntegrationTest',
  endpoint: {
    pattern: '/integrationTest'
  },
  transformation: {
    input: 'XML',
    output: 'JSON'
  },
  requests: {
    lookup: [
      {
        id: 'lookup',
        config: {
          method: 'get',
          url: `http://localhost:${port}`,
          params: {
            id: {
              path: 'payload.id'
            }
          }
        }
      }
    ],
    response: [
      {
        id: 'response',
        config: {
          method: 'get',
          url: `http://localhost:${port}`,
          params: {
            place: {
              path: 'payload.place.address'
            },
            code: {
              path: 'query.code',
              prefix: 'code:',
              postfix: ':code'
            }
          }
        }
      }
    ]
  },
  constants: {
    resourceType: 'Dj'
  },
  inputMapping: {
    'constants.resourceType': 'resourceType',
    'requestBody.name': 'firstName',
    'requestBody.surname': 'lastName',
    'requestBody.attributes': 'character',
    'lookupRequests.lookup.id': 'id'
  },
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
          attributes: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        required: ['name']
      },
      lookupRequests: {
        type: 'object',
        properties: {
          lookup: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              }
            },
            required: ['id']
          }
        }
      }
    }
  },
  lastUpdated: new Date()
}

db.open(config.mongoUrl)

exports.createTestEndpoint = callback => {
  db.createEndpoint(testEndpointContent, callback)
}

exports.removeTestEndpoint = callback => {
  // Clean out any docs created for the integration test
  db.deleteEndpoints({name: 'IntegrationTest'}, callback)
}

let server

// server for external requests tests. Returns body containing the query parameters in the request
exports.startExternalTestServer = () => {
  server = http.createServer((req, res) => {
    const query = url.parse(req.url, true).query

    if (query && query.id) {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({id: query.id}))
    } else if (query && query.place && query.code) {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({place: query.place, code: query.code}))
    } else {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end('')
    }
  })
  server.listen(port)
}

exports.closeExternalTestServer = () => {
  if (server) {
    db.close()
    server.close()
  }
}
