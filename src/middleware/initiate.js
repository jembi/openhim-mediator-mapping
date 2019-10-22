'use strict'

const uuid = require('uuid')

const logger = require('../logger')

exports.initiateContextMiddleware = metaData => async (ctx, next) => {
  // set request UUID from incoming OpenHIM header if present, else create a random UUID
  ctx.state.uuid = ctx.headers['x-openhim-transactionid']
    ? ctx.headers['x-openhim-transactionid']
    : uuid.v4()
  ctx.state.metaData = metaData

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Initiating new request`
  )
  await next()
}
