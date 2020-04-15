'use strict'

const KoaBodyParser = require('@viweei/koa-body-parser')

const logger = require('./logger')

const {
  statesCursor
} = require('./db/services/states/cursor')

exports.createWsStates = route => {
  return route.all('/test/:id', function (ctx) {
    logger.info('WebSocket opened.')

    // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
    // the websocket is added to the context on `ctx.websocket`.
    let sendSockRequest
    // return `next` to pass the context (ctx) on to the next ws middleware
  
    ctx.websocket.on('message', function(message) {
    // do something with the message from client
    console.log(message);
    });

    statesCursor(ctx)
  
    ctx.websocket.on('close', function() {
      console.log('close socket');
      clearInterval(sendSockRequest)
    });
  
    let counter = 0
    sendSockRequest = setInterval(() => {
    counter++
    ctx.websocket.send('Hello World ' + counter);
    console.log('send sock request')
    }, 2000)
  })
}
