const mongoose = require('mongoose')

const endpointSchema = new mongoose.Schema({
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
      required: true,
      index: {
        unique: true
      }
    }
  },
  transformation: {
    input: {type: String, required: true},
    output: {type: String, required: true}
  },
  requests: {
    lookup: [],
    response: []
  },
  constants: {},
  inputMapping: {},
  inputValidation: {},
  lastUpdated: {type: Date, required: true}
})

module.exports = mongoose.model('endpoint', endpointSchema)
