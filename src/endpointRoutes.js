'use strict'

const rawBodyParser = require('raw-body')

const logger = require('./logger')

const {handleServerError} = require('./util')

const endpointServices = require('./db/services/endpoints')

const KoaBodyParser = () => async (ctx, next) => {
  try {
    const body = await rawBodyParser(ctx.req)

    ctx.request.body = body.toString() ? JSON.parse(body) : {}
    await next()
  } catch (error) {
    const failureMsg = 'Parsing incoming request body failed: '
    ctx.statusCode = 400
    handleServerError(ctx, failureMsg, error, logger)
  }
}

const createEndpointRoute = router => {
  router.post('/endpoints', KoaBodyParser(), async (ctx, next) => {
    const failureMsg = 'Create endpoint failed:'

    try {
      await endpointServices
        .createEndpoint(ctx.request.body)
        .then(result => {
          ctx.status = 201
          ctx.body = result
          logger.info(
            `Endpoint "${result.name}" created on ${result.endpoint.pattern}`
          )
          return next()
        })
        .catch(error => {
          ctx.statusCode = 400
          handleServerError(ctx, failureMsg, error, logger)
          return next()
        })
    } catch (error) {
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const readEndpointRoute = router => {
  router.get('/endpoints/:endpointId', async (ctx, next) => {
    const failureMsg = 'Retrieving of endpoint failed: '

    try {
      const endpointId = ctx.params.endpointId

      await endpointServices
        .readEndpoint(endpointId)
        .then(endpoint => {
          if (endpoint) {
            ctx.status = 200
            ctx.body = endpoint
            logger.info(
              `Endpoint "${endpoint.name}" with pattern ${endpoint.endpoint.pattern} has been retrieved`
            )
          } else {
            const error = `Endpoint with id ${endpointId} does not exist`
            ctx.status = 404
            ctx.body = {error: error}
            logger.error(`${failureMsg}${error}`)
          }
          next()
        })
        .catch(error => {
          ctx.statusCode = 500
          handleServerError(ctx, failureMsg, error, logger)
          next()
        })
    } catch (error) {
      ctx.statusCode = 400
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const readEndpointsRoute = router => {
  router.get('/endpoints', async (ctx, next) => {
    const failureMsg = 'Retrieving of endpoints failed: '

    try {
      const queryParams = ctx.request.query

      await endpointServices
        .readEndpoints(queryParams)
        .then(endpoints => {
          ctx.status = 200
          ctx.body = endpoints
          logger.debug(
            `Retrieved ${
              endpoints.length
            } Endpoints matching query param: ${JSON.stringify(queryParams)}`
          )
          next()
        })
        .catch(error => {
          handleServerError(ctx, failureMsg, error, logger)
          next()
        })
    } catch (error) {
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const updateEndpointRoute = router => {
  router.put('/endpoints/:endpointId', KoaBodyParser(), async (ctx, next) => {
    const failureMsg = 'Updating of endpoint failed: '

    try {
      const endpointId = ctx.params.endpointId

      if (
        !ctx.request ||
        !ctx.request.body ||
        !Object.keys(ctx.request.body).length
      ) {
        ctx.status = 400
        const error = `${failureMsg}Invalid endpoint object`
        ctx.body = {error: error}
        logger.error(error)
        return next()
      }

      const body = Object.assign({lastUpdated: Date.now()}, ctx.request.body)

      await endpointServices
        .updateEndpoint(endpointId, body)
        .then(result => {
          if (result) {
            ctx.status = 200
            ctx.body = result
            logger.info(
              `Endpoint "${result.name}" has been successfully updated`
            )
          } else {
            ctx.status = 404
            const error = `Endpoint with id ${endpointId} does not exist`
            ctx.body = {error: error}
            logger.error(`${failureMsg}${error}`)
          }
          next()
        })
        .catch(error => {
          ctx.statusCode = 400
          handleServerError(ctx, failureMsg, error, logger)
          next()
        })
    } catch (error) {
      ctx.statusCode = 400
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const deleteEndpointRoute = router => {
  router.delete('/endpoints/:endpointId', async (ctx, next) => {
    const failureMsg = `Endpoint deletion failed: `

    try {
      const endpointId = ctx.params.endpointId

      await endpointServices
        .deleteEndpoint(endpointId)
        .then(result => {
          if (result && result.deletedCount) {
            const message = `Endpoint with id '${endpointId}' deleted`
            ctx.status = 200
            ctx.body = {message: message}
            logger.info(message)
          } else {
            ctx.status = 404
            const error = `Endpoint with id '${endpointId}' does not exist`
            ctx.body = {error: error}
            logger.error(`${failureMsg}${error}`)
          }
          next()
        })
        .catch(error => {
          ctx.statusCode = 500
          handleServerError(ctx, failureMsg, error, logger)
          next()
        })
    } catch (error) {
      ctx.statusCode = 400
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

exports.createAPIRoutes = router => {
  createEndpointRoute(router)
  readEndpointRoute(router)
  readEndpointsRoute(router)
  updateEndpointRoute(router)
  deleteEndpointRoute(router)
}
