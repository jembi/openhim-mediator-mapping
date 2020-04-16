'use strict'

const logger = require('./logger')
const {readStates} = require('./db/services/states')

const {
  removeStatesEventListeners,
  setupStatesEventListeners
} = require('./db/services/states/listener')

exports.createWsStates = route => {
  return route.all('/test/:id', async function (ctx) {
    logger.info('WebSocket opened.')

    // const states = await readStates()
    // ctx.websocket.send(JSON.stringify(states))

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
