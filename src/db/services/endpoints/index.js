'use strict'

const mongoose = require('mongoose')

const EndpointModel = require('../../models/endpoints')

const ObjectId = mongoose.Types.ObjectId

exports.createEndpoint = body => {
  const endpoint = new EndpointModel(body)
  return endpoint.save({checkKeys: false})
}

exports.readEndpoint = endpointId => {
  const objectId = new ObjectId(endpointId)
  return EndpointModel.findById(objectId)
}

exports.readEndpoints = queryParams => {
  return EndpointModel.find(queryParams)
}

exports.updateEndpoint = (endpointId, body) => {
  const objectId = new ObjectId(endpointId)
  return EndpointModel.findOneAndUpdate({_id: objectId}, body, {
    new: true,
    runValidators: true
  })
}

exports.deleteEndpoint = endpointId => {
  const objectId = new ObjectId(endpointId)
  return EndpointModel.deleteOne({_id: objectId})
}

exports.deleteEndpoints = queryParams => {
  return EndpointModel.deleteMany(queryParams)
}

exports.validateEndpointId = id => mongoose.Types.ObjectId.isValid(id)
