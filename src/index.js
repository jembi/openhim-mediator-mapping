'use strict'

require('dotenv').config()
const koa = require('koa')
const koaRouter = require('koa-router')
const {DateTime} = require('luxon')

const config = require('./config').getConfig()
const db = require('./db')
const logger = require('./logger')
const openhim = require('./openhim')

const {createAPIRoutes} = require('./endpointRoutes')
const {createMiddlewareRoute} = require('./routes')
const {initiateKafkaClient} = require('./kafka')
const {readEndpoints} = require('./db/services/endpoints')

const app = new koa()
const router = new koaRouter()

createAPIRoutes(router)
createMiddlewareRoute(router)

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

if (!module.parent) {
  db.open(config.mongoUrl)

  app.listen(config.port, async () => {
    logger.info(`Server listening on port ${config.port}...`)

    const endpoints = await readEndpoints({})
    initiateKafkaClient(endpoints)

    if (config.openhim.register) {
      openhim.mediatorSetup()
    }
  })
}
