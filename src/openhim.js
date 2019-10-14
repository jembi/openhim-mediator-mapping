'use strict'

const fs = require('fs')
const path = require('path')

const {registerMediator, activateHeartbeat} = require('openhim-mediator-utils')

const logger = require('./logger')
const config = require('./config')

const mediatorConfigFile = fs.readFileSync(
  path.resolve(__dirname, '..', 'mediatorConfig.json')
)
const mediatorConfigJson = JSON.parse(mediatorConfigFile)

const configOptions = config.getConfig()

const openhimConfig = Object.assign(
  {urn: mediatorConfigJson.urn},
  configOptions.openhim
)

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

exports.mediatorSetup = mediatorSetup
