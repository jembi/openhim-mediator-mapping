'use strict'

const fs = require('fs')
const path = require('path')

const logger = require('./logger')
const {expectedEndpointsDirectories} = require('./constants')

exports.createRoutes = router => {
  validateDirectoryStructure()
  setUpRoutes(router)
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

const setUpRoutes = router => {
  const routeDirectories = fs.readdirSync(
    path.resolve(__dirname, '..', 'endpoints')
  )

  routeDirectories.forEach(directory => {
    const metaFile = fs.readFileSync(
      path.resolve(__dirname, '..', 'endpoints', directory, 'meta.json')
    )
    const metaJson = JSON.parse(metaFile)
    router.post(metaJson.endpoint.pattern, ctx => {
      ctx.body = `${directory} path exists!`
    })
    logger.info(`New Route added: ${directory} at path ${metaJson.endpoint.pattern}`)
  })
}

exports.setUpRoutes
exports.validateDirectoryStructure
