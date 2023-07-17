'use strict'

const axios = require('axios')
const {DateTime} = require('luxon')

const logger = require('../logger')
const {OPENHIM_TRANSACTION_HEADER} = require('../constants')

const {createOrchestration} = require('../orchestrations')
const {extractValueFromObject, makeQuerablePromise} = require('../util')
const kafka = require('../kafka')

const validateRequestStatusCode = allowedStatuses => {
  const stringStatuses = allowedStatuses.map(String)
  return status => {
    if (stringStatuses.includes(String(status))) {
      return true
    } else {
      for (let wildCardStatus of stringStatuses) {
        const validRange = wildCardStatus.match(/.+?(?=xx)/g)
        if (validRange && String(status).substring(0, 1) == validRange[0]) {
          return true
        }
      }
    }
    return false
  }
}

const performLookupRequest = async (ctx, requestDetails) => {
  const reqTimestamp = DateTime.utc().toISO()
  let responseTimestamp, orchestrationError, response

  // capture the lookup request start time
  ctx.state.allData.timestamps.lookupRequests[requestDetails.id] = {
    requestStart: reqTimestamp
  }

  if (ctx.request.headers[OPENHIM_TRANSACTION_HEADER]) {
    requestDetails.config.headers = Object.assign(
      {
        [OPENHIM_TRANSACTION_HEADER]:
          ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
      },
      requestDetails.config.headers
    )
  }

  const requestParameters = addRequestQueryParameters(
    ctx,
    requestDetails.config
  )
  const requestUrl = resolveRequestUrl(ctx, requestDetails.config)
  const body = requestDetails.forwardExistingRequestBody
    ? ctx.request.body
    : null

  const axiosConfig = prepareRequestConfig(
    requestDetails,
    body,
    requestParameters,
    requestUrl
  )

  if (!ctx.state.allData.state) {
    ctx.state.allData.state = {}
  }

  return axios(axiosConfig)
    .then(res => {
      response = res
      response.body = res.data
      responseTimestamp = DateTime.utc().toISO()

      // capture the lookup request end time
      ctx.state.allData.timestamps.lookupRequests[
        requestDetails.id
      ].requestEnd = responseTimestamp
      ctx.state.allData.timestamps.lookupRequests[
        requestDetails.id
      ].requestDuration = DateTime.fromISO(responseTimestamp)
        .diff(
          DateTime.fromISO(
            ctx.state.allData.timestamps.lookupRequests[requestDetails.id]
              .requestStart
          )
        )
        .toObject()

      // Set state lookup status
      ctx.state.allData.state.currentLookupHttpStatus =
        ctx.state.allData.state.currentLookupHttpStatus > response.status
          ? ctx.state.allData.state.currentLookupHttpStatus
          : response.status

      // Assign any data received from the response to the assigned ID in the context
      return {
        [requestDetails.id]: Object.assign(
          {},
          {data: res.data},
          {headers: res.headers}
        )
      }
    })
    .catch(error => {
      orchestrationError = error
      logger.error(`Failed Request Config ${JSON.stringify(error.config)}`)

      if (error.response) {
        ctx.statusCode = error.response.status
        ctx.state.allData.state.currentLookupHttpStatus =
          ctx.state.allData.state.currentLookupHttpStatus >
          error.response.status
            ? ctx.state.allData.state.currentLookupHttpStatus
            : error.response.status
        throw new Error(
          `Incorrect status code ${error.response.status}. ${error.response.data.message}`
        )
      } else if (error.request) {
        ctx.state.allData.state.currentLookupNetworkError = true
        throw new Error(
          `No response from lookup '${requestDetails.id}'. ${error.message}`
        )
      } else {
        ctx.statusCode = 500
        ctx.state.allData.state.currentLookupHttpStatus =
          ctx.state.allData.state.currentLookupHttpStatus > 500
            ? ctx.state.allData.state.currentLookupHttpStatus
            : 500
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Unhandled Error: ${error.message}`)
      }
    })
    .finally(() => {
      // For now these orchestrations are recorded when there are no failures
      if (
        ctx.request.headers &&
        ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
      ) {
        const orchestrationName = `Endpoint Lookup Request: ${ctx.state.metaData.name}: ${requestDetails.id}`
        const orchestration = createOrchestration(
          axiosConfig,
          response,
          reqTimestamp,
          responseTimestamp,
          orchestrationName,
          orchestrationError
        )

        ctx.orchestrations.push(orchestration)
      }
    })
}

const performLookupRequestArray = async (ctx, request) => {
  const items = extractParamValue(request.forEach.items, ctx)

  if (!items || !Array.isArray(items)) {
    throw new Error(
      "forEach.items could not be found at the specified path or the resolved value isn't an array"
    )
  }

  const concurrency = request.forEach.concurrency || 1

  const currentlyExecuting = []
  const allPromises = []

  for (const item of items) {
    const itemRequest = Object.assign({}, request)
    const itemCtx = Object.assign({}, ctx)

    itemCtx.request.body = item
    itemCtx.state.allData.item = item

    const promise = makeQuerablePromise(
      performLookupRequest(itemCtx, itemRequest)
    )
    currentlyExecuting.push(promise)
    allPromises.push(promise)

    if (currentlyExecuting.length === concurrency) {
      // wait for at least one promise to settle
      await Promise.race(currentlyExecuting)
      for (const [index, promise] of currentlyExecuting.entries()) {
        if (promise.isSettled()) {
          currentlyExecuting.splice(index, 1)
        }
      }
    }
  }

  return Promise.all(allPromises).then(responses =>
    responses.reduce(
      (combinedRes, currRes) => {
        if (currRes && currRes[request.id]) {
          combinedRes[request.id].push(currRes[request.id])
        }
        return combinedRes
      },
      {[request.id]: []}
    )
  )
}

const performLookupRequests = (ctx, requests) => {
  if (ctx && !ctx.orchestrations) {
    ctx.orchestrations = []
  }

  return requests.map(async request => {
    if (request.forEach && request.forEach.items) {
      return performLookupRequestArray(ctx, request)
    }

    return performLookupRequest(ctx, request)
  })
}

const prepareLookupRequests = ctx => {
  const requests = Object.assign({}, ctx.state.metaData.requests)
  if (requests.lookup && requests.lookup.length > 0) {
    const responseData = performLookupRequests(ctx, requests.lookup)

    return Promise.all(responseData)
      .then(data => {
        logger.info(
          `${ctx.state.metaData.name} (${ctx.state.uuid}): Successfully performed request/s`
        )
        /* 
          If the response body is stringified JSON from an OpenHIM Mediator,
          parse it and assign the parsed object to the allData lookupRequest field.
          This will give the mapper access to the data as an object. It will also strip off
          the unnecessary orchestration data from the response. This orchestration data is
          passed to the OpenHIM in a separate object. This was causing large response bodies
          with duplicate data.
        */
        const incomingData = Object.assign({}, ...data)
        requests.lookup.forEach(lookupConfig => {
          const lookupResponse = incomingData[lookupConfig.id]
          if (Array.isArray(lookupResponse)) {
            lookupResponse.forEach((arrayResponseItem, index) => {
              const parsedResponse = parseMediatorResponse(arrayResponseItem)
              if (parsedResponse) {
                incomingData[lookupConfig.id][index] = parsedResponse
              }
            })
          } else {
            const parsedResponse = parseMediatorResponse(lookupResponse)
            if (parsedResponse) {
              incomingData[lookupConfig.id] = parsedResponse
            }
          }
        })
        ctx.state.allData.lookupRequests = incomingData
      })
      .catch(error => {
        throw new Error(`Rejected Promise: ${error}`)
      })
  }
  logger.debug(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): No request/s to make`
  )
}

const parseMediatorResponse = lookupResponse => {
  if (
    lookupResponse &&
    lookupResponse['x-mediator-urn'] &&
    lookupResponse.response
  ) {
    try {
      return JSON.parse(lookupResponse.response.body)
    } catch (error) {
      logger.debug(
        `No stringified JSON. Therefore no parsing needed: ${error.message}`
      )
    }
  }
}

const prepareRequestConfig = (
  requestDetails,
  requestBody,
  requestQueryParams,
  requestUrl
) => {
  const options = {}

  if (requestBody) {
    options.data = requestBody
  }

  if (requestQueryParams) {
    options.params = requestQueryParams
  }

  if (requestUrl) {
    options.url = requestUrl
  }

  const requestOptions = Object.assign({}, requestDetails.config, options)
  // This step is separated out as in future the URL contained within the config
  // can be manipulated to add URL parameters taken from the body of an incoming request
  if (
    requestDetails.allowedStatuses &&
    requestDetails.allowedStatuses.length > 0
  ) {
    requestOptions.validateStatus = validateRequestStatusCode(
      requestDetails.allowedStatuses
    )
  }
  return requestOptions
}

const performResponseRequestArray = async (ctx, request) => {
  const items = extractParamValue(request.forEach.items, ctx)

  if (!items || !Array.isArray(items)) {
    throw new Error(
      "forEach.items could not be found at the specified path or the resolved value isn't an array"
    )
  }

  const concurrency = request.forEach.concurrency || 1

  const currentlyExecuting = []
  const allPromises = []

  for (const item of items) {
    const itemRequest = Object.assign({}, request)
    // Prevent array requests being used as the primary
    itemRequest.primary = false
    const itemCtx = Object.assign({}, ctx)

    itemCtx.body = {}
    itemCtx.state.allData.item = item

    const promise = makeQuerablePromise(
      performResponseRequest(itemCtx, item, itemRequest)
    )
    currentlyExecuting.push(promise)
    allPromises.push(promise)

    if (currentlyExecuting.length === concurrency) {
      // wait for at least one promise to settle
      await Promise.race(currentlyExecuting)
      for (const [index, promise] of currentlyExecuting.entries()) {
        if (promise.isSettled()) {
          currentlyExecuting.splice(index, 1)
        }
      }
    }
  }

  return Promise.all(allPromises).then(responses => {
    const arrayResponses = responses.reduce(
      (combinedRes, currRes) => {
        if (currRes && currRes[request.id]) {
          combinedRes[request.id].push(currRes[request.id])
        }
        return combinedRes
      },
      {[request.id]: []}
    )
    ctx.response.body = arrayResponses
    return arrayResponses
  })
}

const performResponseRequests = (ctx, requests) => {
  //Create orchestrations
  if (!ctx.orchestrations) {
    ctx.orchestrations = []
  }

  const body = JSON.parse(JSON.stringify(ctx.body))
  // Empty the koa response body. It already contains the mapped data.
  // This body field will be repopulated with response data from the request/s
  ctx.body = {}

  return requests.map(request => {
    if (
      request &&
      request.id &&
      ((request.config && request.config.url && request.config.method) ||
        request.kafkaProducerTopic)
    ) {
      if (ctx.request.headers[OPENHIM_TRANSACTION_HEADER]) {
        request.config.headers = Object.assign(
          {
            [OPENHIM_TRANSACTION_HEADER]:
              ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
          },
          request.config.headers
        )
      }

      /*
        Set the response request to be the primary
        if there is only one response request
      */
      if (requests.length === 1) {
        requests[0].primary = true
      }

      if (request.forEach && request.forEach.items) {
        return performResponseRequestArray(ctx, request)
      }

      return performResponseRequest(ctx, body, request)
    }
  })
}

// For now only json data is processed
const prepareResponseRequests = async ctx => {
  const requests = ctx.state.metaData.requests

  // Send request downstream only when mapping has been successful
  if (ctx && ctx.status === 200) {
    if (
      requests &&
      Array.isArray(requests.response) &&
      requests.response.length
    ) {
      const promises = performResponseRequests(ctx, requests.response)

      await Promise.all(promises)
        .then(() => {
          logger.info(
            `${ctx.state.metaData.name} (${ctx.state.uuid}): Mapped object successfully orchestrated`
          )
        })
        .catch(error => {
          logger.error(
            `${ctx.state.metaData.name} (${ctx.state.uuid}): Mapped object orchestration failure: ${error.message}`
          )
          throw new Error(`Rejected Promise: ${error}`)
        })
    }
  }
}

/*
  Function that handles request errors.
  It also sets the status code and flags which are used to determine the status Text for the response.
  The function also sets the koa response
*/
const handleRequestError = (ctx, request, requestError) => {
  let response, error

  if (!ctx.routerResponseStatuses) {
    ctx.routerResponseStatuses = []
  }

  if (requestError.response) {
    response = requestError.response

    // Axios response has the data property not the body
    response.body = response.data

    if (response.status >= 500) {
      if (request.primary) {
        ctx.routerResponseStatuses.push('primaryReqFailError')
        setKoaResponseBodyAndHeadersFromPrimary(
          ctx,
          response.status,
          response.headers,
          response.data
        )
      } else {
        ctx.routerResponseStatuses.push('secondaryFailError')
        setKoaResponseBody(ctx, request, response.data)
      }
    } else {
      if (request.primary) {
        ctx.routerResponseStatuses.push('primaryCompleted')
        setKoaResponseBodyAndHeadersFromPrimary(
          ctx,
          response.status,
          response.headers,
          response.data
        )
      } else {
        ctx.routerResponseStatuses.push('secondaryCompleted')
        setKoaResponseBody(ctx, request, response.data)
      }
    }
  } else {
    if (request.primary) {
      ctx.routerResponseStatuses.push('primaryReqFailError')
      setKoaResponseBodyAndHeadersFromPrimary(
        ctx,
        500,
        null,
        requestError.message
      )
    } else {
      ctx.routerResponseStatuses.push('secondaryFailError')

      setKoaResponseBody(ctx, request, requestError.message)
    }
    error = {message: requestError.message}
  }

  return {response, error}
}

// Sets the koa response body and header from the primary request's response
const setKoaResponseBodyAndHeadersFromPrimary = (
  ctx,
  status,
  headers,
  body
) => {
  ctx.hasPrimaryRequest = true
  ctx.body = {}
  ctx.body = body

  // data has already been transferred and therefore has a content-length defined
  if (headers) {
    if (headers['transfer-encoding']) {
      delete headers['transfer-encoding']
    }

    // set main response header to the primary request response
    ctx.set(headers)
  }

  ctx.status = status
}

// Sets the koa response body if there is no primary request
const setKoaResponseBody = (ctx, request, body) => {
  if (!ctx.hasPrimaryRequest) {
    ctx.body[request.id] = body
  }
}

const performResponseRequest = (ctx, body, requestDetails) => {
  if (requestDetails.kafkaProducerTopic) {
    return kafka
      .sendToKafka(requestDetails.kafkaProducerTopic, body)
      .then(res => {
        ctx.body = res
      })
      .catch(err => {
        ctx.body = err.message
      })
  }

  const reqTimestamp = DateTime.utc().toISO()
  let response, orchestrationError, responseTimestamp

  // capture the lookup request start time
  ctx.state.allData.timestamps.lookupRequests[requestDetails.id] = {
    requestStart: reqTimestamp
  }

  const params = addRequestQueryParameters(ctx, requestDetails.config)
  const requestUrl = resolveRequestUrl(ctx, requestDetails.config)

  const axiosConfig = prepareRequestConfig(
    requestDetails,
    body,
    params,
    requestUrl
  )

  return axios(axiosConfig)
    .then(resp => {
      response = resp
      response.body = resp.data
      responseTimestamp = DateTime.utc().toISO()

      // capture the lookup request end time
      ctx.state.allData.timestamps.lookupRequests[
        requestDetails.id
      ].requestEnd = responseTimestamp
      ctx.state.allData.timestamps.lookupRequests[
        requestDetails.id
      ].requestDuration = DateTime.fromISO(responseTimestamp)
        .diff(
          DateTime.fromISO(
            ctx.state.allData.timestamps.lookupRequests[requestDetails.id]
              .requestStart
          )
        )
        .toObject()

      if (requestDetails.primary) {
        setKoaResponseBodyAndHeadersFromPrimary(
          ctx,
          response.status,
          response.headers,
          response.body
        )
      } else {
        setKoaResponseBody(ctx, requestDetails, response.body)
      }
      return {[requestDetails.id]: resp.data}
    })
    .catch(error => {
      responseTimestamp = DateTime.utc().toISO()

      const result = handleRequestError(ctx, requestDetails, error)
      response = result.response
      orchestrationError = result.error
      return {[requestDetails.id]: {response, error: result.error}}
    })
    .finally(() => {
      if (
        ctx.request.headers &&
        ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
      ) {
        const orchestrationName = `Endpoint Response Request: ${ctx.state.metaData.name}: ${requestDetails.id}`
        const orchestration = createOrchestration(
          axiosConfig,
          response,
          reqTimestamp,
          responseTimestamp,
          orchestrationName,
          orchestrationError
        )

        ctx.orchestrations.push(orchestration)
      }
    })
}

const extractParamValue = (path, ctx) => {
  // remove first index as this defines the type of param to extract
  const extractType = path.split('.')[0]

  // remove the extractType property from path
  path = path.replace(`${extractType}.`, '')

  switch (extractType) {
    case 'payload':
      return extractValueFromObject(ctx.request.body, path)
    case 'query':
      return extractValueFromObject(ctx.request.query, path)
    case 'transforms':
      return extractValueFromObject(ctx.state.allData.transforms, path)
    case 'state':
      return extractValueFromObject(ctx.state.allData.state, path)
    case 'lookupRequests':
      return extractValueFromObject(ctx.state.allData.lookupRequests, path)
    case 'responseBody':
      return extractValueFromObject(ctx.state.allData.responseBody, path)
    case 'urlParams':
      return extractValueFromObject(ctx.state.allData.urlParams, path)
    case 'constants':
      return extractValueFromObject(ctx.state.allData.constants, path)
    case 'timestamps':
      return extractValueFromObject(ctx.state.allData.timestamps, path)
    case 'item':
      return extractValueFromObject(ctx.state.allData.item, path)
    default:
      ctx.statusCode = 500
      throw new Error(
        `Unsupported Query Parameter Extract Type: ${extractType}`
      )
  }
}

const addRequestQueryParameters = (ctx, request) => {
  const requestQueryParams = {}

  if (request.params && request.params.query) {
    Object.keys(request.params.query).forEach(paramName => {
      const queryParamOptions = request.params.query[`${paramName}`]
      const fullPath = queryParamOptions.path

      const parameterValue = extractParamValue(fullPath, ctx)

      if (parameterValue != null) {
        const prefix = queryParamOptions.prefix ? queryParamOptions.prefix : ''
        const postfix = queryParamOptions.postfix
          ? queryParamOptions.postfix
          : ''
        requestQueryParams[
          `${paramName}`
        ] = `${prefix}${parameterValue}${postfix}`
      }
    })
  }

  return requestQueryParams
}

const resolveRequestUrl = (ctx, request) => {
  let url = request.url

  if (request.params && request.params.url) {
    Object.keys(request.params.url).forEach(paramName => {
      const urlParamOptions = request.params.url[paramName]
      const fullPath = urlParamOptions.path

      const parameterValue = extractParamValue(fullPath, ctx)

      if (parameterValue != null) {
        const prefix = urlParamOptions.prefix ? urlParamOptions.prefix : ''
        const postfix = urlParamOptions.postfix ? urlParamOptions.postfix : ''
        url = url.replace(
          new RegExp(`:${paramName}`, 'g'),
          `${prefix}${parameterValue}${postfix}`
        )
      }
    })
  }

  return url
}

exports.requestsMiddleware = () => async (ctx, next) => {
  await prepareLookupRequests(ctx)
  await next()
  await prepareResponseRequests(ctx)
}
