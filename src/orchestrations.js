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
  if (request.url) {
    urlObject = new URL(request.url)
  }

  const requestObject = {
    host: urlObject.hostname ? urlObject.hostname : '',
    port: urlObject.port ? urlObject.port : '',
    path: urlObject.pathname ? urlObject.pathname : '',
    method: request.method ? request.method : '',
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
    name: orchestrationName
  }

  if (error) {
    orchestration.error = error
  }

  return orchestration
}
