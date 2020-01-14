'use strict'

const logger = require('../logger')

exports.requestsMiddleware = () => async (ctx, next) => {
  logger.info('Meta Data: ', ctx.state.metaData)
  await next()
}
