'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('./logger')
const {expectedEndpointsDirectories, meta} = require('./constants')
const {transformInput} = require('./middleware/mapper')
const {validateInput} = require('./middleware/validator')
const {inputMeta, inputValidation, inputMapping} = require('./constants')

exports.createRoutes = router => {
  validateDirectoryStructure()
  setUpRoutes(router)
}

const validateDirectoryStructure = () => {
  if (!fs.existsSync(path.resolve(__dirname, '..', 'endpoints'))) {
    throw new Error('Directory "endpoints" not found in project root')
  }

  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )
  let correctDirectoryStructure = true
  routeDirectories.forEach(directory => {
    expectedEndpointsDirectories.forEach(expectedFile => {
      if (
        !fs.existsSync(
          path.resolve(__dirname, '..', 'endpoints', directory, expectedFile)
        )
      ) {
        logger.error(
          `Missing file "${expectedFile}" in directory "${directory}"`
        )
        correctDirectoryStructure = false
      }
    })
  })
  if (!correctDirectoryStructure) {
    throw new Error('Add required files then restart app')
  }
}

const createObjectFromFile = (directory, endpointFile) => {
  const jsonData = fs.readFileSync(
    path.resolve(__dirname, '..', 'endpoints', directory, endpointFile)
  )
  return JSON.parse(jsonData)
}

const setUpRoutes = router => {
  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )

  routeDirectories.forEach(directory => {
    const metaData = createObjectFromFile(directory, inputMeta)
    const validationMap = createObjectFromFile(directory, inputValidation)
    const mappingSchema = createObjectFromFile(directory, inputMapping)

    metaData.endpoint.methods.forEach(method => {
      router[`${method}`](
        metaData.endpoint.pattern,
        validateInput(validationMap),
        transformInput(mappingSchema)
      )
    })

    logger.info(
      `Route added: ${directory} at path ${metaData.endpoint.pattern} for methods ${metaData.endpoint.methods}`
    )
  })
}
