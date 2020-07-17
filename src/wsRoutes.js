'use strict'

const logger = require('./logger')
const {readStates} = require('./db/services/states')
const {
  getAllStatesCount,
  getAllStatesCountByEndpointId
} = require('./db/services/states/wsMetrics')

const {
  removeStatesEventListeners,
  setupStatesEventListeners
} = require('./db/services/states/listener')

exports.createWsStates = route => {
  return route.all('/test/:id', async function (ctx) {
    logger.info('WebSocket opened.')

    const states = await readStates()
    ctx.websocket.send(JSON.stringify(states))

    setupStatesEventListeners(ctx.websocket)

    ctx.websocket.on('close', () => {
      console.log('WebSocket closed')
      removeStatesEventListeners()
    })

    ctx.websocket.on('error', error => {
      console.log(error)
      removeStatesEventListeners()
    })
  })
}

exports.createWsMetrics = route => {
  return route.all('/metrics', function (ctx) {
    logger.info('WebSocket Metrics opened.')

    const interval = setInterval(async () => {
      const statesCount = await getAllStatesCount()
      console.log(statesCount)
      ctx.websocket.send(JSON.stringify(statesCount))
    }, 500)

    ctx.websocket.on('close', () => {
      console.log('WebSocket closed')
      clearInterval(interval)
    })

    ctx.websocket.on('error', error => {
      console.log(error)
      clearInterval(interval)
    })
  })
}

exports.createWsMetricsEndpoint = route => {
  return route.all('/metrics/:endpointId', function (ctx, endpointId) {
    logger.info('WebSocket Metrics Endpoint opened.')
    console.log(endpointId)

    const interval = setInterval(async () => {
      const statesCount = await getAllStatesCountByEndpointId(endpointId)
      console.log(statesCount)
      ctx.websocket.send(JSON.stringify(statesCount))
    }, 500)

    ctx.websocket.on('close', () => {
      console.log('WebSocket closed')
      clearInterval(interval)
    })

    ctx.websocket.on('error', error => {
      console.log(error)
      clearInterval(interval)
    })
  })
}
