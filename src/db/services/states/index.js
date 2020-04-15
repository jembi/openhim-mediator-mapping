'use strict'

const StateModel = require('../../models/states')

exports.createState = state => {
  const stateObject = new StateModel(state)
  return stateObject.save({checkKeys: false})
}

exports.readStateByEndpointId = endpointId => {
  return StateModel.findOne({ _endpointReference: endpointId }, {}, { sort: { 'createdAt' : -1 }})
}
