'use strict'

const xml2js = require('xml2js')
const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('../logger')
const constants = require('../constants')
const config = require('../config').getConfig()

const xmlBuilder = new xml2js.Builder()

const parseOutgoingBody = (ctx, outputFormat) => {
  if (outputFormat === 'XML') {
    try {
      logger.info(`Parsing outgoing body in ${outputFormat} format`)
      ctx.body = xmlBuilder.buildObject(ctx.body)
      ctx.set('Content-Type', 'application/xml')
    } catch (error) {
      throw new Error(`Parsing outgoing body failed: ${error.message}`)
    }
  }
}

const parseIncomingBody = async (ctx, inputFormat, next) => {
  // parse incoming body
  // KoaBodyParser executed the next() callback to allow the other middleware to continue before coming back here
  if (constants.allowedContentTypes.includes(inputFormat)) {
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
        trim: config.parser.xmlOptions.trim == 'true',
        explicitRoot: config.parser.xmlOptions.explicitRoot == 'true',
        explicitArray: config.parser.xmlOptions.explicitArray == 'true'
      }
    }

    try {
      logger.info(`Parsing incoming body into JSON format for processing`)
      await KoaBodyParser(options)(ctx, next)
    } catch (error) {
      throw new Error(`Parsing incoming body failed: ${error.message}`)
    }
  } else {
    throw new Error(`transformation method "${inputFormat}" not yet supported`)
  }
}

exports.parseBodyMiddleware = metaData => async (ctx, next) => {
  try {
    // parse incoming body
    await parseIncomingBody(ctx, metaData.transformation.input, next)

    // wait for middleware to bubble up before running the below method

    // parse outgoing body
    parseOutgoingBody(ctx, metaData.transformation.output)
  } catch (error) {
    ctx.status = 400
    ctx.body = xmlBuilder.buildObject({error: error.message})
    return logger.error(error.message)
  }
}

if (process.env.NODE_ENV === 'test') {
  exports.parseIncomingBody = parseIncomingBody
  exports.parseOutgoingBody = parseOutgoingBody
}
