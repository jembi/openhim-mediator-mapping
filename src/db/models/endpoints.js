'use strict'

const mongoose = require('mongoose')

const {
  ALLOWED_CONTENT_TYPES,
  MIDDLEWARE_PATH_REGEX
} = require('../../constants')

const endpointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    },
    description: String,
    endpoint: {
      pattern: {
        type: String,
        match: MIDDLEWARE_PATH_REGEX,
        required: true,
        index: {
          unique: true
        }
      }
    },
    transformation: {
      input: {type: String, enum: ALLOWED_CONTENT_TYPES, required: true},
      output: {type: String, enum: ALLOWED_CONTENT_TYPES, required: true}
    },
    requests: {
      lookup: [],
      response: []
    },
    constants: {},
    inputMapping: {},
    inputValidation: {},
    state: {
      extract: {}
    }
  },
  {
    timestamps: true // set the created_at/updated_at timestamps on the record
  }
)

module.exports = mongoose.model('endpoint', endpointSchema)
