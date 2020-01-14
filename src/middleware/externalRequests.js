'use strict'

const logger = require('../logger')

exports.externalRequest = () => async (ctx, next) => {
  logger.info('Meta Data: ', ctx.state.metaData)
  await next()
}
