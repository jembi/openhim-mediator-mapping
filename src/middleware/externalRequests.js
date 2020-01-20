'use strict'

const fetch = require('node-fetch')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logger = require('../logger')

const mediatorConfigFile = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'mediatorConfig.json')
)
const mediatorConfigJson = JSON.parse(mediatorConfigFile)

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
      return fetch(requestDetails.url)
        .then(checkStatus)
        .then(async res => {
          // Assign any data received from the response to the assigned id in the context
          ctx.externalRequest[requestDetails.id] = await res.text()
        })
        .catch(err => {
          logger.error(err)
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

// For now only json data is processed
const sendResponseRequest = async (ctx, requests) => {
  // Send request downstream only when mapping has been successful
  if (ctx && ctx.status === 200) {
    if (
      requests &&
      Array.isArray(requests.response) &&
      requests.response.length
    ) {
      //Create orchestrations
      ctx.orchestrations = []

      const promises = requests.response.map(request => {
        if (request && request.url && request.method && request.id) {
          const body = ctx.body
          const axiosConfig = {
            url: request.url,
            method: request.method,
            body: body
          }

          if (
            request.credentials &&
            request.credentials.username &&
            request.credentials.password
          ) {
            axiosConfig.auth = {
              username: request.credentials.username,
              password: request.credentials.password
            }
          }

          if (request.headers) {
            axiosConfig.headers = request.headers
          }

          ctx.body = {}
          const reqTimestamp = new Date()

          return axios(axiosConfig).then(response => {
            // The two http methods supported are PUT and POST
            if ([201, 200].includes(response.status)) {
              if (request.primary) {
                ctx.hasPrimaryRequest = true
                ctx.body = {}
                ctx.body[request.id] = response.body

                const orch = createOrchestration(
                  request.url,
                  request.method,
                  ctx.headers,
                  body,
                  response,
                  reqTimestamp
                )

                ctx.orchestrations.push(orch)
              } else {
                if (!ctx.hasPrimaryRequest) {
                  ctx.body[request.id] = response.body
                }
                const orch = createOrchestration(
                  request.url,
                  request.method,
                  request.headers,
                  body,
                  response,
                  reqTimestamp
                )

                ctx.orchestrations.push(orch)
              }
            }
          })
        }
      })

      await Promise.all(promises)
        .then(() => {
          ctx
          if (ctx.headers) {

          }
        })
    }
  }
}

const createOrchestration = (
  url,
  method,
  headers,
  reqBody,
  responseObject,
  reqTimestamp,
  name
) => {
  if (!url || !method)
    throw new Error('Orchestration creation failed: url/method not supplied')
  if (!reqTimestamp)
    throw new Error('Orchestration request timestamp not supplied')
  if (!name) throw new Error('Orchestration name not supplied')

  const request = {
    host: urlObject.hostname,
    port: urlObject.port,
    path: urlObject.pathname,
    timestamp: reqTimestamp
  }
  const response = {}
  const urlObject = new URL(url)

  if (urlObject.searchParams) {
    request.queryString = urlObject.searchParams
  }
  if (headers) {
    request.headers = headers
  }
  if (reqBody) {
    request.body = reqBody
  }
  if (responseObject && responseObject.status) {
    response.status = responseObject.status
  }
  if (responseObject && responseObject.body) {
    response.status = responseObject.body
  }
  if (responseObject && responseObject.headers) {
    response.status = responseObject.headers
  }

  const orchestration = {
    request,
    response,
    name: name
  }

  return orchestration
}

if (process.env.NODE_ENV === 'test') {
  exports.createOrchestration = createOrchestration
  exports.sendResponseRequest = sendResponseRequest
}

const contructOpenhimResponse = (ctx, response, orchestration) {
  ctx.body = `
    
  `
}