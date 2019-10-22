'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')
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

const metaFileContent = {
  name: 'IntegrationTest',
  endpoint: {
    pattern: '/integrationTest'
  },
  transformation: {
    input: 'XML',
    output: 'JSON'
  }
}

const inputValidationFileContent = {
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
}

const inputMappingFileContent = {
  input: {
    name: 'firstName',
    surname: 'lastName',
    'attributes': 'character'
  },
  constants: {
    resourceType: "resourceType"
  }
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

exports.createTestEndpoint = (callback) => {
  if (!fs.existsSync(pathToDirectory)) {
    fs.mkdir(pathToDirectory, err => {
      if (err) return reject(err)
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
