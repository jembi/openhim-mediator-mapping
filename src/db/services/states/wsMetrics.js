'use strict'

const StateModel = require('../../models/states')
const ObjectId = require('mongoose').Types.ObjectId

exports.getAllStatesCountByEndpointId = endpointId => {
  return StateModel.aggregate([
    {$match: {_endpointReference: new ObjectId(endpointId)}},
    {$group: {_id: null, myCount: {$sum: 1}}},
    {$project: {_id: 0}}
  ])
}

exports.getAllStatesCount = () => {
  return StateModel.aggregate([
    {$group: {_id: null, myCount: {$sum: 1}}},
    {$project: {_id: 0}}
  ])
}
