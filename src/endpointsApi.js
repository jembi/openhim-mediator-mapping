'use strict'

const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('./logger')
const {handleServerError, validateEndpoint} = require('./util')
const {
  deleteEndpoint,
  saveEndpoint,
  updateEndpoint
} = require('./mongoose-methods/endpoints')

const createEndpoint = router => {
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
      const inValid = validateEndpoint(body)

      if (inValid) {
        ctx.status = 400
        ctx.body = {error: inValid}
        logger.error(inValid)
        return next()
      }

      await saveEndpoint(body)
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

const createUpdateEndpoint = router => {
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
          ctx.status = 200
          ctx.body = result
          logger.info(
            `Endpoint with pattern ${result.endpoint.pattern} updated`
          )
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

const createDeleteEndpoint = router => {
  router.delete('/endpoints/:endpointId', async (ctx, next) => {
    const failureMsg = `Endpoint deletion failed: `
    const endpointId = ctx.params.endpointId

    await deleteEndpoint(endpointId)
      .then(() => {
        ctx.status = 200
        const message = `Endpoint with id '${endpointId}' deleted`
        ctx.body = {message: message}
        next()
      })
      .catch(err => {
        handleServerError(ctx, failureMsg, err, logger)
        return next()
      })
  })
}

exports.createEndpointRoutes = router => {
  createEndpoint(router)
  createUpdateEndpoint(router)
  createDeleteEndpoint(router)
}
