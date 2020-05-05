'use strict'

const EndpointModel = require('../../models/endpoints')
const logger = require('../../../logger')

const endpointService = require('.')

let eventEmitter
let endpointCache = []

exports.setupEventListeners = () => {
  eventEmitter = EndpointModel.watch()
  eventEmitter
    .on('change', addChangeListener)
    .on('end', addCloseListener)
    .on('error', addErrorListener)
  logger.info('MongoDB Change Event Listeners Added')
}

exports.removeEventListeners = () => {
  eventEmitter
    .removeAllListeners('change', addChangeListener)
    .removeAllListeners('end', addCloseListener)
    .removeAllListeners('error', addErrorListener)
  logger.info('MongoDB Change Event Listeners Removed')
}

const addChangeListener = change => {
  logger.debug(
    `EndpointId: ${change.documentKey._id} - Registered Change Event: ${change.operationType}`
  )
  populateEndpointCache()
}

const addCloseListener = () => {
  logger.fatal('MongoDB connection stream closed.')
}

const addErrorListener = error => {
  logger.fatal(`MongoDB Error detected: ${error.message}`)
}

const populateEndpointCache = async () => {
  await endpointService
    .readEndpoints()
    .then(updatedEndpoints => {
      endpointCache.splice(0, endpointCache.length)
      endpointCache.push(...updatedEndpoints)
    })
    .catch(error => {
      logger.fatal(
        `Failed to Read endpoints and Populate endpointCache. Caused by: ${error.message}`
      )
      throw error
    })
}

exports.populateEndpointCache = populateEndpointCache
exports.endpointCache = endpointCache
