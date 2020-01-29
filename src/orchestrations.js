'use strict'

exports.createOrchestration = (
  request,
  reqBody,
  responseObject,
  reqTimestamp,
  responseTimestamp,
  orchestrationName,
  error
) => {
  if (!reqTimestamp || !orchestrationName)
    throw new Error(
      'Orchestration creation failed: required parameter not supplied'
    )

  let urlObject
  if (request.config.url) {
    urlObject = new URL(request.config.url)
  }

  const requestObject = {
    host: urlObject.hostname ? urlObject.hostname : '',
    port: urlObject.port ? urlObject.port : '',
    path: urlObject.pathname ? urlObject.pathname : '',
    method: request.config.method ? request.config.method : '',
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
    requestObject.body = JSON.stringify(reqBody)
  }
  if (responseObject && responseObject.status) {
    response.status = responseObject.status
  }
  if (responseObject && responseObject.body) {
    response.body = JSON.stringify(responseObject.body)
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
