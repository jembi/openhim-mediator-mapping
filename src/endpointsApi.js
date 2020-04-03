'use strict'

const logger = require('./logger')
const EndpointModel = require('./models/endpoints')
const {handleServerError} = require('./utils')
const KoaBodyParser = require('@viweei/koa-body-parser')

exports.CreateEndpointRoutes = router => {
  router.post('/endpoint/:pattern', KoaBodyParser(), async (ctx, next) => {
    const failureMsg = 'Endpoint creation/update failed: '

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

    try {
      const pattern = ctx.params.pattern

      EndpointModel.findOneAndUpdate(
        {endpoint: {pattern: pattern}},
        ctx.request.body,
        {new: true, upsert: true},
        (err, res) => {
          if (err) {
            throw err
          }
          ctx.status = 201
          ctx.body = res
          next()
        }
      )
    } catch (error) {
      handleServerError(ctx, failureMsg, error)
      next()
    }
  })

  router.delete('/endpoint/:pattern', async (ctx, next) => {
    const failureMsg = `Endpoint deletion failed: `

    try {
      const pattern = ctx.params.pattern
      EndpointModel.deleteOne({endpoint: {pattern: pattern}}, err => {
        if (err) throw err
        ctx.status = 200
        ctx.body = {message: `Endpoint with '${pattern}' deleted`}
        next()
      })
    } catch (error) {
      handleServerError(ctx, failureMsg, error)
    }
  })
}
