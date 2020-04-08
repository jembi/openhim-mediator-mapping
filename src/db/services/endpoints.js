'use strict'

const EndpointModel = require('../models/endpoints')
const logger = require('../../logger')

const {EndpointCache} = require('../../middleware/initiate')

exports.createEndpoint = body => {
  const endpoint = new EndpointModel(body)
  return endpoint.save({checkKeys: false})
}

const readEndpoints = queryParams => {
  return EndpointModel.find(queryParams)
}

exports.updateEndpoint = (endpointId, body) => {
  return EndpointModel.findOneAndUpdate({_id: endpointId}, body, {
    new: true,
    runValidators: true
  })
}

exports.deleteEndpoint = endpointId => {
  return EndpointModel.deleteOne({_id: endpointId})
}

exports.deleteEndpoints = queryParams => {
  return EndpointModel.deleteMany(queryParams)
}

exports.setupChangeListener = () => {
  const eventEmitter = EndpointModel.watch()
  eventEmitter.on('change', async change => {
    logger.debug(
      `EndpointId: ${change.documentKey._id} - Registered Change Event: ${change.operationType}`
    )
    await readEndpoints()
      .then(endpoints => {
        EndpointCache.splice(0, EndpointCache.length)
        EndpointCache.push(...endpoints)
      })
      .catch(error => {
        logger.error(
          `Failed to Read endpoints and Update EndpointCache. Caused by: ${error.message}`
        )
        throw error
      })
  })
}

exports.readEndpoints = readEndpoints
