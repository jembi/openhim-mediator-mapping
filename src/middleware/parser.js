'use strict'

const xml2js = require('xml2js')
const KoaBodyParser = require('@viweei/koa-body-parser')

const config = require('../config').getConfig()
const logger = require('../logger')

const {
  ALLOWED_CONTENT_TYPES,
  OPENHIM_TRANSACTION_HEADER
} = require('../constants')
const {createOrchestration, setStatusText} = require('../orchestrations')
const {constructOpenhimResponse} = require('../openhim')

const xmlBuilder = new xml2js.Builder()

const parseOutgoingBody = (ctx, outputFormat) => {
  if (!ctx.orchestrations) {
    ctx.orchestrations = []
  }

  if (outputFormat === 'XML') {
    try {
      const parserStartTime = new Date()
      const body = ctx.body

      ctx.body = xmlBuilder.buildObject(ctx.body)
      ctx.set('Content-Type', 'application/xml')

      if (
        ctx.request.headers &&
        ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
      ) {
        const orchestrationName = 'Outgoing Parser'
        const parserEndTime = new Date()
        const response = {
          body: ctx.body
        }
        const error = null

        const orchestration = createOrchestration(
          {data: body},
          response,
          parserStartTime,
          parserEndTime,
          orchestrationName,
          error
        )

        ctx.orchestrations.push(orchestration)
      }
    } catch (error) {
      throw new Error(
        `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing outgoing body failed: ${error.message}`
      )
    }
  } else {
    ctx.set('Content-Type', `application/${outputFormat.toLowerCase()}`)
  }

  if (!ctx.statusText) {
    setStatusText(ctx)
  }

  // Respond in openhim mediator format if request came from the openhim
  if (
    ctx.request &&
    ctx.request.headers &&
    ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
  ) {
    constructOpenhimResponse(ctx, Date.now())
  }

  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing outgoing body into ${outputFormat} format`
  )
}

const parseIncomingBody = async (ctx, inputFormat) => {
  ctx.state.allData.query = ctx.request.query

  // parse incoming body if request is of type post only
  if (ctx.request.method === 'GET' || ctx.request.method === 'DELETE') {
    logger.debug(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing skipped due to method type: ${ctx.request.method}`
    )
    return
  }

  // KoaBodyParser executed the next() callback to allow the other middleware to continue before coming back here
  if (ALLOWED_CONTENT_TYPES.includes(inputFormat)) {
    // check content-type matches inputForm specified
    if (!ctx.get('Content-Type').includes(inputFormat.toLowerCase())) {
      throw new Error(
        `Supplied input format does not match incoming content-type: Expected ${inputFormat.toLowerCase()} format, but received ${
          ctx.get('Content-Type').split('/')[1]
        }`
      )
    }

    const options = {
      limit: config.parser.limit,
      xmlOptions: {
        trim: config.parser.xmlOptions.trim,
        explicitRoot: config.parser.xmlOptions.explicitRoot,
        explicitArray: config.parser.xmlOptions.explicitArray
      }
    }

    logger.info(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing incoming body into JSON format for processing`
    )

    try {
      const parserStartTime = new Date()

      // Cater for custom json types application/fhir+json and application/openhim+json
      // The body parser does not support these content-types
      if (inputFormat.toLowerCase().match('json') && ctx.headers) {
        ctx.headers['content-type'] = 'application/json'
      }

      await KoaBodyParser(options)(ctx, () => {
        // pass in a empty function in place of the next() callback used in the middleware
        // next() is handled outside of the internal middleware
        // Using next() inside this middleware inject the next middleware logic inside this one

        // set the incoming payload/query params as useable data point
        ctx.state.allData.requestBody = ctx.request.body

        if (
          ctx.request.headers &&
          ctx.request.headers[OPENHIM_TRANSACTION_HEADER]
        ) {
          if (inputFormat === 'XML') {
            const orchestrationName = 'Incoming Parser'
            const parserEndTime = new Date()
            const response = {
              body: ctx.request.body
            }
            const error = null

            if (!ctx.orchestrations) {
              ctx.orchestrations = []
            }

            const orchestration = createOrchestration(
              {data: ctx.request.raw_body},
              response,
              parserStartTime,
              parserEndTime,
              orchestrationName,
              error
            )

            ctx.orchestrations.push(orchestration)
          }
        }
      })
    } catch (error) {
      throw Error(
        `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing incoming body failed: ${error.message}`
      )
    }
  } else {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): transformation method "${inputFormat}" not yet supported`
    )
  }
}

exports.parseBodyMiddleware = () => async (ctx, next) => {
  const inputContentType =
    ctx.state.metaData &&
    ctx.state.metaData.transformation &&
    ctx.state.metaData.transformation.input
      ? ctx.state.metaData.transformation.input.toUpperCase()
      : ''
  const outputContentType =
    ctx.state.metaData &&
    ctx.state.metaData.transformation &&
    ctx.state.metaData.transformation.output
      ? ctx.state.metaData.transformation.output.toUpperCase()
      : ''

  try {
    // parse incoming body
    await parseIncomingBody(ctx, inputContentType)

    await next()

    // wait for middleware to bubble up before running the below method

    // parse outgoing body
    parseOutgoingBody(ctx, outputContentType)
  } catch (error) {
    ctx.status = ctx.statusCode ? ctx.statusCode : 400
    ctx.statusText = 'Failed'
    logger.error(error.message)

    // parse outgoing body
    ctx.body = {error: error.message}
    return parseOutgoingBody(ctx, outputContentType)
  }
}
