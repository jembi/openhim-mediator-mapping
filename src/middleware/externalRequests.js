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
    const responseData = requests.lookup.map(requestDetails => {
      logger.debug(requestDetails.url)
      return fetch(requestDetails.url)
        .then(checkStatus)
        .then(res => {
          return {[requestDetails.id]: res.json()}
        })
        .catch(err => {
          logger.error(err)
        })
    })

    await Promise.all(responseData)
      .then(result => {
        logger.info(`Promise all data: ${result}`)
      })
      .catch(err => {
        logger.error(err)
      })
  }
  await next()
}
