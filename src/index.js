'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const openhim = require('./openhim')
const logger = require('./logger')
const config = require('./config').getConfig()
const routes = require('./routes')

const app = new koa()
const router = new koaRouter()

routes.createRoutes(router)

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}...`)

  if (config.openhim.register) {
    openhim.mediatorSetup()
  }
})
