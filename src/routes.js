'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('./logger')
const {expectedEndpointsDirectories} = require('./constants')

exports.createRoutes = router => {
  validateDirectoryStructure()

  router.all('/', ctx => {
    ctx.body = 'Hello World!'
  })
}

const validateDirectoryStructure = () => {
  if (!fs.existsSync(path.resolve(__dirname, '..', 'endpoints'))) {
    logger.error('Directory "endpoints" not found in project root')
    process.exit(1)
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
    logger.error('Add required files')
    process.exit(1)
  }
}

exports.validateDirectoryStructure
