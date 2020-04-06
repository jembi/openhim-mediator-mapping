'use strict'

const logger = require('./logger')
const EndpointModel = require('./models/endpoints')
const {handleServerError, validateEndpoint} = require('./util')
const KoaBodyParser = require('@viweei/koa-body-parser')

const saveEndPoint = body => {
  return new Promise((resolve, reject) => {
    const endpoint = new EndpointModel(body)
    endpoint.save(err => {
      if (err) reject(err)
      resolve(endpoint)
    })
  })
}

const updateEndPoint = (endpointId, body) => {
  return new Promise((resolve, reject) => {
    EndpointModel.findOneAndUpdate(
      {_id: endpointId},
      body,
      {new: true, runValidators: true},
      (err, result) => {
        if (err) reject(err)
        resolve(result)
      }
    )
  })
}

const createCreateEndpoint = router => {
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
      const body = Object.assign({}, ctx.request.body, {
        lastUpdated: Date.now()
      })
      const inValid = validateEndpoint(body)

      if (inValid) {
        ctx.status = 400
        ctx.error = {error: inValid}
        logger.error(inValid)
        return next()
      }

      await saveEndPoint(body)
        .then(result => {
          ctx.status = 201
          ctx.body = result
          logger.info(`Endpoint with id ${result.id} created`)
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

      const body = Object.assign({}, ctx.request.body, {
        lastUpdated: Date.now()
      })

      await updateEndPoint(endpointId, body)
        .then(result => {
          ctx.status = 200
          ctx.body = result
          logger.info(`Endpoint with id ${endpointId} updated`)
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

    try {
      const endpointId = ctx.params.endpointId
      await EndpointModel.deleteOne({_id: endpointId}, err => {
        if (err) {
          handleServerError(ctx, failureMsg, err, logger)
          return next()
        }
        ctx.status = 200
        const message = `Endpoint with id '${endpointId}' deleted`
        ctx.body = {message: message}
        next()
      })
    } catch (error) {
      handleServerError(ctx, failureMsg, error, logger)
      next()
    }
  })
}

exports.createEndpointRoutes = router => {
  createCreateEndpoint(router)
  createUpdateEndpoint(router)
  createDeleteEndpoint(router)
}
