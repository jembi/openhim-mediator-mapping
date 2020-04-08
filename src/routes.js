'use strict'

const logger = require('./logger')
const {requestsMiddleware} = require('./middleware/externalRequests')
const {initiateContextMiddleware} = require('./middleware/initiate')
const {parseBodyMiddleware} = require('./middleware/parser')
const {mapBodyMiddleware} = require('./middleware/mapper')
const {validateBodyMiddleware} = require('./middleware/validator')
const {readEndpoints} = require('./db/services/endpoints')

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
