'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('./logger')
const {expectedEndpointsDirectories, meta} = require('./constants')
const {validateInput} = require('./middleware/validator')
const {transformInput} = require('./middleware/mapper')

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

const setUpRoutes = router => {
  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )

  routeDirectories.forEach(directory => {
    const metaFile = fs.readFileSync(
      path.resolve(__dirname, '..', 'endpoints', directory, meta)
    )
    const metaJson = JSON.parse(metaFile)
    router.post(
      metaJson.endpoint.pattern,
      validateInput(directory),
      transformInput(directory)
    )

    logger.info(
      `New Route added: ${directory} at path ${metaJson.endpoint.pattern}`
    )
  })
}
