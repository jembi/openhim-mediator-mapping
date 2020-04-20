'use strict'

const mongoose = require('mongoose')

const {MONGOOSE_STRING_TIMESTAMP_REGEX} = require('../../constants')

const stateSchema = new mongoose.Schema(
  {
    _endpointReference: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    system: {
      timestamps: {
        endpointStart: {
          type: String,
          match: MONGOOSE_STRING_TIMESTAMP_REGEX,
          required: true
        },
        endpointEnd: {
          type: String,
          match: MONGOOSE_STRING_TIMESTAMP_REGEX,
          required: true
        },
        endpointDuration: {
          milliseconds: {
            type: Number,
            required: true
          }
        },
        lookupRequests: {}
      }
    },
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
