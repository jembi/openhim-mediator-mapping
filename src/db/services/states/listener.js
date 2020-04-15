'use strict'

const StatesModel = require('../../models/states')
const logger = require('../../../logger')

let eventEmitter
let endpointCache = []

exports.setupStatesEventListeners = (ws) => {
  eventEmitter = StatesModel.watch()
  eventEmitter
    .on('change', (change) => {
      addChangeListener(ws, change)
    })
    .on('end', addCloseListener)
    .on('error', addErrorListener)
  logger.info('MongoDB Change Event Listeners Added - StatesModel')
}

exports.removeStatesEventListeners = () => {
  eventEmitter
    .removeAllListeners('change', addChangeListener)
    .removeAllListeners('end', addCloseListener)
    .removeAllListeners('error', addErrorListener)
  logger.info('MongoDB Change Event Listeners Removed - StatesModel')
}

const addChangeListener = async (ws, change) => {
  // logger.debug(
  //   `EndpointId: ${change.documentKey._id} - Registered Change Event: ${change.operationType}`
  // )
  ws.send(JSON.stringify(change))
}

const addCloseListener = () => {
  logger.fatal('MongoDB connection stream closed.')
}

const addErrorListener = error => {
  logger.fatal(`MongoDB Error detected: ${error.message}`)
}

// exports.populateEndpointCache = populateEndpointCache
exports.endpointCache = endpointCache