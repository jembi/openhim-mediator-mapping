'use strict'

const fetch = require('node-fetch')

const logger = require('../logger')

function checkStatus(res) {
  if (res.ok) {
    return res
  } else {
    throw new Error('Non-2xx Response status')
  }
}

exports.requestsMiddleware = () => async (ctx, next) => {
  const requests = ctx.state.metaData.requests
  if (requests && requests.lookup && requests.lookup.length) {
    ctx.externalRequest = {}
    const responseData = requests.lookup.map(requestDetails => {
      logger.debug(requestDetails.url)
      return fetch(requestDetails.url)
        .then(checkStatus)
        .then(async res => {
          ctx.externalRequest[requestDetails.id] = await res.json()
        })
        .catch(err => {
          logger.error(err)
        })
    })

    await Promise.all(responseData)
      .then(() => {
        logger.info(`CTX 2: ${JSON.stringify(ctx.externalRequest)}`)
      })
      .catch(err => {
        logger.error(err)
      })
  }
  await next()
}
