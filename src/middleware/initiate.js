'use strict'

const uuid = require('uuid')

const logger = require('../logger')

const {constructOpenhimResponse} = require('../openhim')
const {endpointCache} = require('../db/services/endpoints/cache')

const getEndpointByPath = urlPath => {
  for (let endpoint of endpointCache) {
    if (endpoint.endpoint.pattern === urlPath) {
      return endpoint
    }
  }
  return null
}

exports.initiateContextMiddleware = () => async (ctx, next) => {
  const endpoint = getEndpointByPath(ctx.url)
  if (!endpoint) {
    logger.error(`Unknown Endpoint: ${ctx.url}`)

    if (ctx.request.header && ctx.request.header['x-openhim-transactionid']) {
      ctx.response.type = 'application/json+openhim'
      ctx.status = 404
      ctx.response.body = `Unknown Endpoint: ${ctx.url}`
      constructOpenhimResponse(ctx, Date.now())
    }
    return
  }

  // set request UUID from incoming OpenHIM header if present, else create a random UUID
  ctx.state.uuid = ctx.headers['x-openhim-transactionid']
    ? ctx.headers['x-openhim-transactionid']
    : uuid.v4()
  ctx.state.metaData = endpoint

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Initiating new request`
  )
  await next()
}
