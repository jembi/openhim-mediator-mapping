'use strict'

const cors = require('@koa/cors')
const koa = require('koa')
const koaRouter = require('koa-router')
const route = require('koa-route')
const websockify = require('koa-websocket')
const {DateTime} = require('luxon')

const config = require('./config').getConfig()
const db = require('./db')
const logger = require('./logger')
const openhim = require('./openhim')

const {createAPIRoutes} = require('./endpointRoutes')
const {createMiddlewareRoute} = require('./routes')
const {
  createWsStates,
  createWsMetrics,
  createWsMetricsEndpoint
} = require('./wsRoutes')

const app = websockify(new koa())
const router = new koaRouter()

createAPIRoutes(router)
createMiddlewareRoute(router)

app.use(cors())

const millisecondsAtStart = DateTime.utc().ts

router.get('/uptime', (ctx, next) => {
  const now = DateTime.utc().ts
  ctx.status = 200
  ctx.body = {
    milliseconds: now - millisecondsAtStart
  }
  next()
})

app.use(router.routes()).use(router.allowedMethods())

app.ws.use(createWsStates(route))
app.ws.use(createWsMetrics(route))
app.ws.use(createWsMetricsEndpoint(route))

if (!module.parent) {
  db.open(config.mongoUrl)

  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}...`)

    if (config.openhim.register) {
      openhim.mediatorSetup()
    }
  })
}
