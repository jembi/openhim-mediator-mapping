'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const openhim = require('./openhim')
const logger = require('./logger')
const config = require('./config').getConfig()
const routes = require('./routes')
const {createEndpointRoutes} = require('./endpointsApi')
const db = require('./db')

const app = new koa()
const router = new koaRouter()

createEndpointRoutes(router)
routes.createRoutes(router)

app.use(router.routes()).use(router.allowedMethods())

if (!module.parent) {
  db.open()

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
