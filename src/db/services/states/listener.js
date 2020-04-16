'use strict'

const StatesModel = require('../../models/states')
const logger = require('../../../logger')

let eventEmitter

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
  ws.send(JSON.stringify(change))
}

const addCloseListener = () => {
  logger.fatal('MongoDB connection stream closed.')
}

const addErrorListener = error => {
  logger.fatal(`MongoDB Error detected: ${error.message}`)
}