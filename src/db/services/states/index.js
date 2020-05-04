'use strict'

const StateModel = require('../../models/states')

exports.createEndpointState = state => {
  const stateObject = new StateModel(state)
  return stateObject.save({checkKeys: false})
}

exports.readStates = () => {
  return StateModel.find({}, {}, {limit: 100, sort: {createdAt: -1}})
}

exports.readLatestEndpointStateById = endpointId => {
  return StateModel.findOne(
    {_endpointReference: endpointId},
    {},
    {sort: {createdAt: -1}}
  )
}
