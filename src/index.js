'use strict'

const koa = require('koa')
const koaBody = require('koa-body')
const koaRouter = require('koa-router')
const fs = require('fs')
const path = require('path')

const {registerMediator, activateHeartbeat} = require('openhim-mediator-utils')

const logger = require('./logger')
const config = require('./config')
const routes = require('./routes')

const mediatorConfigFile = fs.readFileSync(
  path.resolve(__dirname, '..', 'mediatorConfig.json')
)
const mediatorConfigJson = JSON.parse(mediatorConfigFile)

const configOptions = config.getConfig()

const openhimConfig = Object.assign(
  {urn: mediatorConfigJson.urn},
  configOptions.openhim
)

const app = new koa()
const router = new koaRouter()

routes.createRoutes(router)

app.use(koaBody()).use(router.routes()).use(router.allowedMethods())

app.listen(configOptions.port, () => {
  logger.info(`Server listening on port ${configOptions.port}...`)

  mediatorSetup()
})

const mediatorSetup = () => {
  registerMediator(openhimConfig, mediatorConfigJson, err => {
    if (err) {
      logger.error('Failed to register mediator')
      throw new Error(err.message)
    }

    logger.info('Successfully registered mediator!')

    const emitter = activateHeartbeat(openhimConfig)

    emitter.on('error', err => {
      logger.error('Heartbeat failed: ', err)
    })
  })
}
