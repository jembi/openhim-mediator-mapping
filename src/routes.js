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
const {parseBodyMiddleware} = require('./middleware/parser')
const {transformInput} = require('./middleware/mapper')
const {validateInput} = require('./middleware/validator')

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
  if (
    !fs.existsSync(
      path.resolve(__dirname, '..', 'endpoints', directory, expectedFile)
    )
  ) {
    return false
  }
  return true
}

const validateAndLoadFile = (directory, endpointFile, required) => {
  if (validateFileExists(directory, endpointFile)) {
    return createObjectFromFile(directory, endpointFile)
  }

  if (required) {
    logger.error(
      `Missing file "${endpointFile}" in directory "${directory}"`
    )
    return null
  }
  
  return true
}

const setUpRoutes = router => {
  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )

  routeDirectories.forEach(directory => {
    const metaData = validateAndLoadFile(directory, inputMeta, true)
    const validationMap = validateAndLoadFile(directory, inputValidation, true)
    const mappingSchema = validateAndLoadFile(directory, inputMapping, true)
    const constants = validateAndLoadFile(directory, inputConstants, false)

    if (metaData && validationMap && mappingSchema && constants) {
      router.post(
        metaData.endpoint.pattern,
        parseBodyMiddleware(metaData),
        validateInput(validationMap),
        transformInput(mappingSchema, constants)
      )

      logger.info(
        `New Route added: ${directory} at path ${metaData.endpoint.pattern}`
      )
    } else {
      logger.error(
        `Route failed to start: ${directory} at path ${metaData.endpoint.pattern}`
      )
    }
  })
}
