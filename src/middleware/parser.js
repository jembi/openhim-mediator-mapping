'use strict'

const xml2js = require('xml2js')
const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('../logger')
const {ALLOWED_CONTENT_TYPES} = require('../constants')
const config = require('../config').getConfig()

const xmlBuilder = new xml2js.Builder()

const parseOutgoingBody = (ctx, outputFormat) => {
  if (outputFormat === 'XML') {
    try {
      ctx.body = xmlBuilder.buildObject(ctx.body)
      ctx.set('Content-Type', 'application/xml')
    } catch (error) {
      throw new Error(
        `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing outgoing body failed: ${error.message}`
      )
    }
  }
  logger.info(
    `${ctx.state.metaData.name} (${ctx.state.uuid}): Parsing outgoing body into ${outputFormat} format`
  )
}

const parseIncomingBody = async (ctx, inputFormat, next) => {
  // parse incoming body
  // KoaBodyParser executed the next() callback to allow the other middleware to continue before coming back here
  if (ALLOWED_CONTENT_TYPES.includes(inputFormat)) {
    // check content-type matches inputForm specified
    if (!ctx.get('Content-Type').includes(inputFormat.toLowerCase())) {
      throw new Error(
        `${ctx.state.metaData.name} (${
          ctx.state.uuid
        }): Supplied input format does not match incoming content-type: Expected ${inputFormat.toLowerCase()} format, but received ${
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
    await KoaBodyParser(options)(ctx, next)
  } else {
    throw new Error(
      `${ctx.state.metaData.name} (${ctx.state.uuid}): transformation method "${inputFormat}" not yet supported`
    )
  }
}

exports.parseBodyMiddleware = metaData => async (ctx, next) => {
  const incomingContentType = ctx
    .get('Content-Type')
    .split('/')[1]
    .toUpperCase()
  const outputContentType = metaData.transformation.output.toUpperCase()
  try {
    // parse incoming body
    await parseIncomingBody(ctx, incomingContentType, next)

    // wait for middleware to bubble up before running the below method

    // parse outgoing body
    parseOutgoingBody(ctx, outputContentType)
  } catch (error) {
    ctx.status = 400
    logger.error(error.message)

    // parse outgoing body
    ctx.body = {error: error.message}
    return parseOutgoingBody(ctx, outputContentType)
  }
}
