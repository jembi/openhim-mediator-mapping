'use strict'

const fs = require('fs')
const path = require('path')

const {
  inputMeta,
  inputValidation,
  inputMapping,
  inputConstants
} = require('./constants')
const logger = require('./logger')
const {requestsMiddleware} = require('./middleware/externalRequests')
const {initiateContextMiddleware} = require('./middleware/initiate')
const {parseBodyMiddleware} = require('./middleware/parser')
const {mapBodyMiddleware} = require('./middleware/mapper')
const {validateBodyMiddleware} = require('./middleware/validator')

exports.createRoutes = router => {
  validateDirectoryStructure()
  setUpRoutes(router)
}

const validateDirectoryStructure = () => {
  if (!fs.existsSync(path.resolve(__dirname, '..', 'endpoints'))) {
    throw new Error('Directory "endpoints" not found in project root')
  }
}

const createObjectFromFile = (directory, endpointFile) => {
  const jsonData = fs.readFileSync(
    path.resolve(__dirname, '..', 'endpoints', directory, endpointFile)
  )
  return JSON.parse(jsonData)
}

const validateFileExists = (directory, expectedFile) => {
  return !fs.existsSync(
    path.resolve(__dirname, '..', 'endpoints', directory, expectedFile)
  )
    ? false
    : true
}

const validateAndLoadFile = (directory, endpointFile, required) => {
  if (validateFileExists(directory, endpointFile)) {
    return createObjectFromFile(directory, endpointFile)
  }

  if (required) {
    throw new Error(
      `Missing file "${endpointFile}" in directory "${directory}"`
    )
  }

  return null
}

const setUpRoutes = router => {
  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )

  routeDirectories.forEach(directory => {
    try {
      const metaData = validateAndLoadFile(directory, inputMeta, true)
      const validationMap = validateAndLoadFile(
        directory,
        inputValidation,
        true
      )
      const mappingSchema = validateAndLoadFile(directory, inputMapping, true)
      const constants = validateAndLoadFile(directory, inputConstants, false)

      router.post(
        metaData.endpoint.pattern,
        initiateContextMiddleware(metaData),
        requestsMiddleware(),
        parseBodyMiddleware(),
        validateBodyMiddleware(validationMap),
        mapBodyMiddleware(mappingSchema, constants)
      )

      logger.info(
        `Route added: "${directory}" at endpoint "${metaData.endpoint.pattern}"`
      )
    } catch (error) {
      logger.error(`Route setup failed: ${error.message}`)
    }
  })
}
