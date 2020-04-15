'use strict'

const logger = require('./logger')

const {
  removeStatesEventListeners,
  setupStatesEventListeners
} = require('./db/services/states/listener')

exports.createWsStates = route => {
  return route.all('/test/:id', function (ctx) {
    logger.info('WebSocket opened.')

    setupStatesEventListeners(ctx.websocket)

    ctx.websocket.on('close', () => {
      console.log('closed')
      removeStatesEventListeners()
    })
  
    ctx.websocket.on('error', (error) => {
      console.log(error)
      removeStatesEventListeners()
    })
  })
}
