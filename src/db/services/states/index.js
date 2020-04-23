'use strict'

const StateModel = require('../../models/states')

exports.createEndpointState = state => {
  const stateObject = new StateModel(state)
  return stateObject.save({checkKeys: false})
}

exports.readLatestEndpointStateById = endpointId => {
  return StateModel.findOne(
    {_endpointReference: endpointId},
    {},
    {sort: {createdAt: -1}}
  )
}
