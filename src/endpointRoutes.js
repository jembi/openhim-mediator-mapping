'use strict'

const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('./logger')
const {handleServerError} = require('./util')
const {
  deleteEndpoint,
  createEndpoint,
  updateEndpoint
} = require('./db/services/endpoints')

const createEndpointRoute = router => {
  router.post('/endpoints', async (ctx, next) => {
    const failureMsg = 'Endpoint creation/update failed: '

    try {
      await KoaBodyParser()(ctx, () => {})

      if (
        !ctx.request ||
        !ctx.request.body ||
        !Object.keys(ctx.request.body).length
      ) {
        ctx.status = 400
        const err = `${failureMsg}Invalid endpoint object`
        ctx.body = {error: err}
        logger.error(err)
        return next()
      }
      const body = Object.assign({lastUpdated: Date.now()}, ctx.request.body)

      await createEndpoint(body)
        .then(result => {
          ctx.status = 201
          ctx.body = result
          logger.info(
            `Endpoint with pattern ${result.endpoint.pattern} created`
          )
          return next()
        })
        .catch(err => {
          handleServerError(ctx, failureMsg, err, logger)
          return next()
        })
    } catch (error) {
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

const updateEndpointRoute = router => {
  router.put('/endpoints/:endpointId', async (ctx, next) => {
    const failureMsg = 'Updating of endpoint failed: '

    try {
      await KoaBodyParser()(ctx, () => {})
      const endpointId = ctx.params.endpointId

      if (
        !ctx.request ||
        !ctx.request.body ||
        !Object.keys(ctx.request.body).length
      ) {
        ctx.status = 400
        const err = `${failureMsg}Invalid endpoint object`
        ctx.body = {error: err}
        logger.error(err)
        return next()
      }

      const body = Object.assign({lastUpdated: Date.now()}, ctx.request.body)

      await updateEndpoint(endpointId, body)
        .then(result => {
          if (result) {
            ctx.status = 200
            ctx.body = result
            logger.info(
              `Endpoint with pattern ${result.endpoint.pattern} updated`
            )
          } else {
            ctx.status = 404
            const error = `Endpoint with id ${endpointId} does not exist`
            ctx.body = {error: error}
            logger.error(`${failureMsg}${error}`)
          }
          next()
        })
        .catch(err => {
          handleServerError(ctx, failureMsg, err, logger)
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
          ctx.status = 200
          ctx.body = result
          logger.info(`Endpoint with id '${endpointId}' deleted`)
        } else {
          ctx.status = 404
          const error = `Endpoint with id '${endpointId}' does not exist`
          ctx.body = {error: error}
          logger.error(`${failureMsg}${error}`)
        }
        next()
      })
      .catch(err => {
        handleServerError(ctx, failureMsg, err, logger)
        return next()
      })
  })
}

exports.createAPIRoutes = router => {
  createEndpointRoute(router)
  updateEndpointRoute(router)
  deleteEndpointRoute(router)
}