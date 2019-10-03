'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const {registerMediator, activateHeartbeat} = require('openhim-mediator-utils')

const logger = require('./logger')
const mediatorConfig = require('./mediatorConfig.json')
const config = require('./config')

const configOptions = config.getConfig()

const openhimConfig = Object.assign(
  {urn: mediatorConfig.urn},
  configOptions.openhim
)

const app = new koa()
const router = new koaRouter()

router.all('/', ctx => {
  ctx.body = 'Hello World!'
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(configOptions.port, () => {
  logger.info(`Server listening on port ${configOptions.port}...`)

  mediatorSetup()
})

const mediatorSetup = () => {
  registerMediator(openhimConfig, mediatorConfig, err => {
    if (err) {
      logger.error('Failed to register mediator. Check your Config: ', err)
      process.exit(1)
    }

    logger.info('Successfully registered mediator!')

    const emitter = activateHeartbeat(openhimConfig)

    emitter.on('error', err => {
      logger.error('Heartbeat failed: ', err)
    })
  })
}
