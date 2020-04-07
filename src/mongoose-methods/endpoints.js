'use strict'

const EndpointModel = require('../models/endpoints')

exports.saveEndpoint = body => {
  return new Promise((resolve, reject) => {
    const endpoint = new EndpointModel(body)
    endpoint.save(err => {
      if (err) return reject(err)
      resolve(endpoint)
    })
  })
}

exports.updateEndpoint = (endpointId, body) => {
  return new Promise((resolve, reject) => {
    EndpointModel.findOneAndUpdate(
      {_id: endpointId},
      body,
      {new: true, runValidators: true},
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

exports.deleteEndpoint = endpointId => {
  return new Promise((resolve, reject) => {
    EndpointModel.deleteOne({_id: endpointId}, err => {
      if (err) return reject(err)
      resolve({message: `Endpoint with id '${endpointId}' deleted`})
    })
  })
}
