'use strict'

const mongoose = require('mongoose')

const stateSchema = new mongoose.Schema(
  {
    _endpointReference: {
      type: String,
      required: true
    },
    system: {},
    requestBody: {},
    responseBody: {},
    query: {},
    lookupRequests: {}
  },
  {
    timestamps: true // set the created_at/updated_at timestamps on the record
  }
)

module.exports = mongoose.model('state', stateSchema)
