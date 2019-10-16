'use strict'

const xml2js = require('xml2js')
const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('../logger')
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
  if (['JSON', 'XML'].includes(inputFormat)) {
    const options = {
      limit: '1mb',
      xmlOptions: {
        trim: true,
        explicitRoot: false,
        explicitArray: false
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
