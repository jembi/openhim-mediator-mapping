'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const config = require('./config').getConfig()
const db = require('./db/main')
const logger = require('./logger')
const openhim = require('./openhim')
const routes = require('./routes')

const {createEndpointRoutes} = require('./endpointRoutes')

const app = new koa()
const router = new koaRouter()

createEndpointRoutes(router)
routes.createRoutes(router)

app.use(router.routes()).use(router.allowedMethods())

if (!module.parent) {
  db.open(config.mongoUrl)

  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}...`)

    if (config.openhim.register) {
      openhim.mediatorSetup()
    }
  })
}

if (process.env.NODE_ENV === 'test') {
  module.exports = app
}
