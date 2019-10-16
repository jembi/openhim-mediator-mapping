'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const openhim = require('./openhim')
const logger = require('./logger')
const config = require('./config')
const routes = require('./routes')

const configOptions = config.getConfig()
const registerMediator = (configOptions.openhim.register == 'true')

const app = new koa()
const router = new koaRouter()

routes.createRoutes(router)

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(configOptions.port, () => {
  logger.info(`Server listening on port ${configOptions.port}...`)

  if (registerMediator) {
    openhim.mediatorSetup()
  }
})
