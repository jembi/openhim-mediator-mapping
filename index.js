'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')

const {registerMediator, activateHeartbeat} = require('openhim-mediator-utils')

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
  console.log(`Server listening on port ${configOptions.port}...`)

  mediatorSetup()
})

const mediatorSetup = () => {
  registerMediator(openhimConfig, mediatorConfig, err => {
    if (err) {
      console.error('Failed to register mediator. Check your Config: ', err)
      process.exit(1)
    }

    console.log('Successfully registered mediator!')

    const emitter = activateHeartbeat(openhimConfig)

    emitter.on('error', err => {
      console.error('Heartbeat failed: ', err)
    })
  })
}
