'use strict'

const logger = require('./logger')

const {initiateContextMiddleware} = require('./middleware/initiate')
const {mapBodyMiddleware} = require('./middleware/mapper')
const {parseBodyMiddleware} = require('./middleware/parser')
const {readEndpoints} = require('./db/services/endpoints')
const {requestsMiddleware} = require('./middleware/externalRequests')
const {validateBodyMiddleware} = require('./middleware/validator')

exports.createRoutes = router => {
  setUpRoutes(router)
}

const setUpRoutes = async router => {
  await readEndpoints()
    .then(endpointConfigs => {
      endpointConfigs.forEach(routeConfig => {
        const metaData = routeConfig
        const validationMap = routeConfig.inputValidation
        const mappingSchema = routeConfig.inputMapping
        const constants = routeConfig.constants

        router.post(
          metaData.endpoint.pattern,
          initiateContextMiddleware(metaData),
          parseBodyMiddleware(),
          requestsMiddleware(),
          validateBodyMiddleware(validationMap),
          mapBodyMiddleware(mappingSchema, constants)
        )

        logger.info(
          `Route added: "${routeConfig.name}" at endpoint "${metaData.endpoint.pattern}"`
        )
      })
    })
    .catch(error => {
      logger.error(`Route setup failed: ${error.message}`)
      throw error
    })
}
