'use strict'

const {initiateContextMiddleware} = require('./middleware/initiate')
const {mapBodyMiddleware} = require('./middleware/mapper')
const {parseBodyMiddleware} = require('./middleware/parser')
const {requestsMiddleware} = require('./middleware/externalRequests')
const {transformerMiddleware} = require('./middleware/transformer')
const {validateBodyMiddleware} = require('./middleware/validator')
const {MIDDLEWARE_PATH_REGEX, ALLOWED_HTTP_METHODS} = require('./constants')
const {populateEndpointCache} = require('./db/services/endpoints/cache')

const middlewareRoute = async router => {
  populateEndpointCache()

  ALLOWED_HTTP_METHODS.forEach(method => {
    router[`${method.toLowerCase()}`](
      MIDDLEWARE_PATH_REGEX,
      initiateContextMiddleware(),
      parseBodyMiddleware(),
      requestsMiddleware(),
      validateBodyMiddleware(),
      transformerMiddleware(),
      mapBodyMiddleware()
    )
  })
}

exports.createMiddlewareRoute = router => {
  middlewareRoute(router)
}
