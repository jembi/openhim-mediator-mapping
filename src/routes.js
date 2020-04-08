'use strict'

const logger = require('./logger')

const {
  EndpointCache,
  initiateContextMiddleware
} = require('./middleware/initiate')
const {mapBodyMiddleware} = require('./middleware/mapper')
const {parseBodyMiddleware} = require('./middleware/parser')
const {requestsMiddleware} = require('./middleware/externalRequests')
const {validateBodyMiddleware} = require('./middleware/validator')
const {MIDDLEWARE_PATH_REGEX} = require('./constants')
const {readEndpoints, setupChangeListener} = require('./db/services/endpoints')

const initiateEndpointCache = async () => {
  await readEndpoints({})
    .then(endpoints => {
      EndpointCache.push(...endpoints)
    })
    .catch(error => {
      logger.error(
        `Failed to initiate endpoint cache. Caused by: ${error.message}`
      )
      throw error
    })
}

const middlewareRoute = async router => {
  initiateEndpointCache()
  setupChangeListener()

  router.post(
    MIDDLEWARE_PATH_REGEX,
    initiateContextMiddleware(),
    parseBodyMiddleware(),
    requestsMiddleware(),
    validateBodyMiddleware(),
    mapBodyMiddleware()
  )
}

exports.createMiddlewareRoute = router => {
  middlewareRoute(router)
}
