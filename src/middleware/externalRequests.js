'use strict'

const axios = require('axios')
const queryString = require('querystring')

const logger = require('../logger')

function prepareRequestConfig(requestDetails, query) {
  const requestOptions = {
    url: `${requestDetails.url}?${queryString.stringify(query)}`,
    method: requestDetails.method || 'get'
  }
  if (requestDetails && requestDetails.headers != null) {
    requestOptions.headers = requestDetails.headers
  }
  return requestOptions
}

exports.requestsMiddleware = () => async (ctx, next) => {
  const requests = ctx.state.metaData.requests
  if (requests && requests.lookup && requests.lookup.length > 0) {
    ctx.externalRequest = {}
    const responseData = requests.lookup.map(requestDetails => {
      return axios(prepareRequestConfig(requestDetails, ctx.request.query))
        .then(res => {
          // Assign any data received from the response to the assigned id in the context
          ctx.externalRequest[requestDetails.id] = res.data
        })
        .catch(error => {
          logger.error(
            `${ctx.state.metaData.name} (${
              ctx.state.uuid
            }): Failed Request Config ${JSON.stringify(error.config, null, 2)}`
          )
          if (error.response) {
            throw new Error(
              `Incorrect status code ${error.response.status}. ${error.response.data.message}`
            )
          } else if (error.request) {
            throw new Error(
              `No response from lookup '${requestDetails.id}'. ${error.request}`
            )
          } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Unhandled Error: ${error.message}`)
          }
        })
    })

    await Promise.all(responseData)
      .then(() => {
        logger.debug(
          `All requests resolved: ${JSON.stringify(ctx.externalRequest)}`
        )
      })
      .catch(err => {
        logger.error(err)
      })
  }
  await next()
}
