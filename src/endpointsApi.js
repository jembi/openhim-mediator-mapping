'use strict'

const logger = require('./logger')
const EndpointModel = require('./models/endpoints')

exports.CreateEndpointRoute = router => {
  router.post('/endpoint/:pattern', async (ctx, next) => {
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

    let pattern
    try {
      pattern = ctx.params.pattern

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
      ctx.status = 500
      const err = `${failureMsg}${error.message}`
      ctx.body = {error: err}
      logger.error(err)
      next()
    }
  })
}
