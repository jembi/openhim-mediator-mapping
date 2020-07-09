'use strict'

const querystring = require('querystring')

exports.createOrchestration = (
  requestAxiosConfig,
  responseObject,
  reqTimestamp,
  responseTimestamp,
  orchestrationName,
  error
) => {
  if (!reqTimestamp || !orchestrationName)
    throw new Error(
      'Orchestration creation failed: required parameter not supplied - reqTimestamp | orchestrationName'
    )

  let urlObject
  if (requestAxiosConfig && requestAxiosConfig.url) {
    urlObject = new URL(requestAxiosConfig.url)
  }

  const requestObject = {
    host: urlObject && urlObject.hostname ? urlObject.hostname : '',
    port: urlObject && urlObject.port ? urlObject.port : '',
    path: urlObject && urlObject.pathname ? urlObject.pathname : '',
    method: requestAxiosConfig.method ? requestAxiosConfig.method : '',
    timestamp: reqTimestamp
  }

  const response = {
    timestamp: responseTimestamp
  }

  if (urlObject && urlObject.searchParams) {
    requestObject.queryString = urlObject.searchParams.toString()
  }
  if (requestAxiosConfig.params) {
    requestObject.queryString = `${
      requestObject.queryString
    }&${querystring.stringify(requestAxiosConfig.params)}`
  }
  if (requestAxiosConfig.headers) {
    requestObject.headers = requestAxiosConfig.headers
  }
  if (requestAxiosConfig.data) {
    requestObject.body =
      typeof requestAxiosConfig.data === 'string'
        ? requestAxiosConfig.data
        : JSON.stringify(requestAxiosConfig.data)
  }
  if (responseObject && responseObject.status) {
    response.status = responseObject.status
  }
  if (responseObject && responseObject.body) {
    response.body =
      typeof responseObject.body === 'string'
        ? responseObject.body
        : JSON.stringify(responseObject.body)
  }
  if (responseObject && responseObject.headers) {
    response.headers = responseObject.headers
  }

  const orchestration = {
    request: requestObject,
    response,
    name: orchestrationName
  }

  if (error) {
    orchestration.error = error
  }

  return orchestration
}

exports.setStatusText = ctx => {
  if (
    ctx.routerResponseStatuses &&
    ctx.routerResponseStatuses.includes('primaryReqFailError')
  ) {
    return (ctx.statusText = 'Failed')
  }

  if (
    ctx.routerResponseStatuses &&
    ctx.routerResponseStatuses.includes('secondaryFailError')
  ) {
    return (ctx.statusText = 'Completed with error(s)')
  }

  if (
    ctx.routerResponseStatuses &&
    (ctx.routerResponseStatuses.includes('primaryCompleted') ||
      ctx.routerResponseStatuses.includes('secondaryCompleted'))
  ) {
    return (ctx.statusText = 'Completed')
  }

  return (ctx.statusText = 'Successful')
}
