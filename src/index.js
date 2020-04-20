'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const config = require('./config').getConfig()
const db = require('./db')
const logger = require('./logger')
const openhim = require('./openhim')

const {createAPIRoutes} = require('./endpointRoutes')
const {createMiddlewareRoute} = require('./routes')

const app = new koa()
const router = new koaRouter()

createAPIRoutes(router)
createMiddlewareRoute(router)

router.get('/_health', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    status: 'UP'
  }
  next()
})

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
