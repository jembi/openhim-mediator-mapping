'use strict'

const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('./logger')
const {handleServerError} = require('./util')
const {
  deleteEndpoint,
  createEndpoint,
  readEndpoint,
  readEndpoints,
  updateEndpoint
} = require('./db/services/endpoints')

const createEndpointRoute = router => {
  router.post('/endpoints', KoaBodyParser(), async (ctx, next) => {
    const failureMsg = 'Endpoint creation/update failed: '

    try {
      const body = Object.assign({lastUpdated: Date.now()}, ctx.request.body)

      await createEndpoint(body)
        .then(result => {
          ctx.status = 201
          ctx.body = result
          logger.info(
            `Endpoint "${result.endpoint.name}" has been successfully created on endpoint ${result.endpoint.pattern}`
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
    const endpointId = ctx.params.endpointId

    await readEndpoint(endpointId)
      .then(endpoint => {
        if (endpoint) {
          ctx.status = 200
          ctx.body = endpoint
          logger.info(
            `Endpoint "${endpoint.endpoint.name}" with pattern ${endpoint.endpoint.pattern} has been retrieved`
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
        ctx.statusCode = 400
        handleServerError(ctx, failureMsg, error, logger)
        next()
      })
  })
}

const readEndpointsRoute = router => {
  router.get('/endpoints', async (ctx, next) => {
    const failureMsg = 'Retrieving of endpoints failed: '

    const queryParams = ctx.request.query

    await readEndpoints(queryParams)
      .then(endpoints => {
        ctx.status = 200
        ctx.body = endpoints
        logger.debug(`Retrieved ${endpoints.length} Endpoints matching query param: ${JSON.stringify(queryParams)}`)
        next()
      })
      .catch(error => {
        handleServerError(ctx, failureMsg, error, logger)
        next()
      })
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

      await updateEndpoint(endpointId, body)
        .then(result => {
          if (result) {
            ctx.status = 200
            ctx.body = result
            logger.info(
              `Endpoint "${result.endpoint.name}" has been successfully updated`
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
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const deleteEndpointRoute = router => {
  router.delete('/endpoints/:endpointId', async (ctx, next) => {
    const failureMsg = `Endpoint deletion failed: `
    const endpointId = ctx.params.endpointId

    await deleteEndpoint(endpointId)
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
        ctx.statusCode = 400
        handleServerError(ctx, failureMsg, error, logger)
        return next()
      })
  })
}

exports.createAPIRoutes = router => {
  createEndpointRoute(router)
  readEndpointRoute(router)
  readEndpointsRoute(router)
  updateEndpointRoute(router)
  deleteEndpointRoute(router)
}
