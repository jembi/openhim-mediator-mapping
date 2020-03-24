'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')
const http = require('http')
const url = require('url')
const {
  inputMeta,
  inputValidation,
  inputMapping,
  inputConstants
} = require('../src/constants')

const pathToDirectory = path.resolve('endpoints', 'integrationTest')
const metaFilePath = path.resolve(pathToDirectory, inputMeta)
const inputValidationFilePath = path.resolve(pathToDirectory, inputValidation)
const inputMappingFilePath = path.resolve(pathToDirectory, inputMapping)
const inputConstantsFilePath = path.resolve(pathToDirectory, inputConstants)

const port = '3444'
const metaFileContent = {
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
            id: ''
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
            place: '',
            code: ''
          }
        }
      }
    ]
  }
}

const inputValidationFileContent = {
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
}

const inputMappingFileContent = {
  'constants.resourceType': 'resourceType',
  'requestBody.name': 'firstName',
  'requestBody.surname': 'lastName',
  'requestBody.attributes': 'character',
  'lookupRequests.lookup.id': 'id'
}

const inputConstantsFileContent = {
  resourceType: 'Dj'
}

const files = [
  {path: metaFilePath, content: metaFileContent},
  {path: inputValidationFilePath, content: inputValidationFileContent},
  {path: inputMappingFilePath, content: inputMappingFileContent},
  {path: inputConstantsFilePath, content: inputConstantsFileContent}
]

exports.createTestEndpoint = callback => {
  if (!fs.existsSync(pathToDirectory)) {
    fs.mkdir(pathToDirectory, err => {
      if (err) return callback(err)
    })
  }

  const writeFilePromise = util.promisify(fs.writeFile)
  const promises = []

  files.forEach(file => {
    if (!fs.existsSync(file.path)) {
      promises.push(writeFilePromise(file.path, JSON.stringify(file.content)))
    }
  })

  Promise.all(promises).then(() => {
    callback(null, true)
  })
}

exports.removeTestEndpoint = () => {
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }
  })

  if (fs.existsSync(pathToDirectory)) {
    fs.rmdir(pathToDirectory, err => {
      if (err) throw err
    })
  }
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
    server.close()
  }
}
