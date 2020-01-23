'use strict'

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logger = require('../logger')

let mediatorConfigJson, readError

try {
  const mediatorConfigFile = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'mediatorConfig.json')
  )
  mediatorConfigJson = JSON.parse(mediatorConfigFile)
} catch (err) {
  readError = err.message
  logger.error(`Mediator config file could not be retrieved: ${err.message}`)
}

const performRequests = requests => {
  return requests.map(requestDetails => {
    return axios(prepareRequestConfig(requestDetails))
      .then(res => {
        // Assign any data received from the response to the assigned id in the context
        return {[requestDetails.id]: res.data}
      })
      .catch(error => {
        logger.error(
          `Failed Request Config ${JSON.stringify(error.config, null, 2)}`
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
}

const prepareLookupRequests = ctx => {
  const requests = Object.assign({}, ctx.state.metaData.requests)
  if (requests && requests.lookup && requests.lookup.length > 0) {
    const responseData = performRequests(requests.lookup)

    return Promise.all(responseData)
      .then(data => {
        logger.info(
          `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully performed request/s`
        )
        ctx.externalRequests = Object.assign({}, ...data)
      })
      .catch(err => {
        throw new Error(`Rejected Promise: ${err}`)
      })
  } else {
    logger.debug(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): No request/s to make`
    )
  }
}

const prepareRequestConfig = requestDetails => {
  const requestOptions = Object.assign({}, requestDetails.config)
  // This step is separated out as in future the URL contained within the config
  // can be manipulated to add URL parameters taken from the body of an incoming request
  return requestOptions
}

exports.requestsMiddleware = () => async (ctx, next) => {
  await prepareLookupRequests(ctx)
  await next()
  await orchestrateMappingResult(ctx)
}

// For now only json data is processed
const orchestrateMappingResult = async ctx => {
  const requests = ctx.state.metaData.requests

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
          let response, error, responseTimestamp

          return axios(axiosConfig)
            .then(resp => {
              response = resp
              response.body = resp.data
              responseTimestamp = new Date()

              if (request.primary) {
                ctx.hasPrimaryRequest = true
                ctx.body = {}
                ctx.body[request.id] = response.body
                ctx.status = response.status
              } else {
                if (!ctx.hasPrimaryRequest) {
                  ctx.body[request.id] = response.body
                }
              }
            })
            .catch(err => {
              responseTimestamp = new Date()

              if (err.response) {
                response = err.response
                response.body = response.data

                if (response.status >= 500) {
                  if (request.primary) {
                    ctx.hasPrimaryRequest = true
                    ctx.body = {}
                    ctx.body[request.id] = response.data
                    ctx.primaryReqFailError = true
                    ctx.status = response.status
                  } else {
                    ctx.secondaryFailError = true
                    if (!ctx.hasPrimaryRequest) {
                      ctx.body[request.id] = response.data
                    }
                  }
                } else {
                  if (request.primary) {
                    ctx.hasPrimaryRequest = true
                    ctx.body = {}
                    ctx.body[request.id] = response.data
                    ctx.primaryCompleted = true
                    ctx.status = response.status
                  } else {
                    ctx.secondaryCompleted = true
                    if (!ctx.hasPrimaryRequest) {
                      ctx.body[request.id] = response.data
                    }
                  }
                }
              } else {
                if (request.primary) {
                  ctx.hasPrimaryRequest = true
                  ctx.body = {}
                  ctx.body[request.id] = err.message
                  ctx.primaryReqFailError = true
                  ctx.status = 500
                } else {
                  ctx.secondaryFailError = true
                  if (!ctx.hasPrimaryRequest) {
                    ctx.body[request.id] = err.message
                  }
                }
                error = {message: err.message}
              }
            })
            .finally(() => {
              if (
                ctx.request.header &&
                ctx.request.header['X-OpenHIM-TransactionID']
              ) {
                const orch = createOrchestration(
                  request,
                  body,
                  response,
                  reqTimestamp,
                  responseTimestamp,
                  error
                )

                ctx.orchestrations.push(orch)
              }
            })
        }
      })

      await Promise.all(promises)
        .then(() => {
          logger.info('Mapped object successfully orchestrated')
          setStatusText(ctx)
        })
        .catch(err => {
          logger.error(`Mapped object orchestration failure: ${err.message}`)
        })

      // Respond in openhim mediator format if request came from the openhim
      if (ctx.request.header && ctx.request.header['X-OpenHIM-TransactionID']) {
        ctx.set('Content-Type', 'application/json+openhim')

        const date = new Date()

        constructOpenhimResponse(
          ctx,
          ctx.response,
          ctx.orchestrations,
          ctx.statusText,
          date
        )
      }
    }
  }
}

const createOrchestration = (
  request,
  reqBody,
  responseObject,
  reqTimestamp,
  responseTimestamp,
  error
) => {
  if (
    !request ||
    !request.id ||
    !request.method ||
    !request.url ||
    !reqTimestamp
  )
    throw new Error(
      'Orchestration creation failed: required parameter not supplied'
    )

  const urlObject = new URL(request.url)

  const requestObject = {
    host: urlObject.hostname,
    port: urlObject.port,
    path: urlObject.pathname,
    method: request.method,
    timestamp: reqTimestamp
  }

  const response = {
    timestamp: responseTimestamp
  }

  if (urlObject.searchParams) {
    requestObject.queryString = urlObject.searchParams.toString()
  }
  if (request.headers) {
    requestObject.headers = request.headers
  }
  if (reqBody) {
    requestObject.body = reqBody
  }
  if (responseObject && responseObject.status) {
    response.status = responseObject.status
  }
  if (responseObject && responseObject.body) {
    response.body = responseObject.body
  }
  if (responseObject && responseObject.headers) {
    response.headers = responseObject.headers
  }

  const orchestration = {
    request: requestObject,
    response,
    name: request.id
  }

  if (error) {
    orchestration.error = error
  }

  return orchestration
}

const constructOpenhimResponse = (
  ctx,
  response,
  orchestrations,
  statusText,
  responseTimestamp
) => {
  const respObject = {}

  if (response) {
    if (response.headers) {
      respObject.headers = response.headers
    }
    if (response.status) {
      respObject.status = response.status
    }
    if (response.body) {
      respObject.body = response.body
    }
    if (response.timestamp) {
      respObject.timestamp = response.timestamp
    } else if (responseTimestamp) {
      respObject.timestamp = responseTimestamp
    }
  }

  if (readError) {
    mediatorConfigJson = {
      urn: 'undefined'
    }
  }

  const body = {
    'x-mediator-urn': mediatorConfigJson.urn,
    status: statusText,
    response: respObject,
    orchestrations: orchestrations
  }

  ctx.body = JSON.stringify(body)
}

const setStatusText = ctx => {
  if (ctx.primaryReqFailError) {
    ctx.statusText = 'Failed'
  } else if (!ctx.primaryReqFailError && ctx.secondaryFailError) {
    ctx.statusText = 'Completed with error(s)'
  } else if (
    !ctx.primaryReqFailError &&
    !ctx.secondaryFailError &&
    (ctx.primaryCompleted || ctx.secondaryCompleted)
  ) {
    ctx.statusText = 'Completed'
  } else {
    ctx.statusText = 'Successful'
  }
}

if (process.env.NODE_ENV === 'test') {
  exports.createOrchestration = createOrchestration
  exports.orchestrateMappingResult = orchestrateMappingResult
  exports.setStatusText = setStatusText
  exports.constructOpenhimResponse = constructOpenhimResponse
  exports.prepareRequestConfig = prepareRequestConfig
}
