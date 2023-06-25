'use strict'

const mongoose = require('mongoose')

const {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_ENDPOINT_METHODS,
  DEFAULT_ENDPOINT_METHOD,
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
        required: true
      },
      method: {
        type: String,
        enum: ALLOWED_ENDPOINT_METHODS,
        default: DEFAULT_ENDPOINT_METHOD
      }
    },
    transformation: {
      input: {
        type: String,
        enum: ALLOWED_CONTENT_TYPES,
        required: function () {
          return (
            this &&
            this.endpoint &&
            this.endpoint.method &&
            (this.endpoint.method === 'POST' || this.endpoint.method === 'PUT')
          )
        }
      },
      output: {type: String, enum: ALLOWED_CONTENT_TYPES, required: true}
    },
    requests: {
      lookup: [],
      response: []
    },
    constants: {},
    inputMapping: {},
    inputTransforms: {},
    inputValidation: {},
    state: {
      default: {},
      extract: {},
      config: {
        networkErrors: {
          type: String, // This field adds a filter on the returned states by network errors.
          enum: ['include', 'exclude', 'no-filter'],
          default: 'no-filter'
        },
        includeStatuses: [String] // This field adds a filter on the returned states for http statuses. Example values ['*', '201', '4xx']
      }
    }
  },
  {
    minimize: false,
    timestamps: true // set the created_at/updated_at timestamps on the record
  }
)

endpointSchema.pre('save', async function (next) {
  var endpoint = this

  if (!endpoint.isModified('endpoint')) return next()

  if (
    endpoint.endpoint.pattern.match(/\/:\//) ||
    endpoint.endpoint.pattern[endpoint.endpoint.pattern.length - 1] == ':'
  ) {
    return next(
      Error(
        'Invalid url parameters specified in pattern, url parameter specification format is "/:<PARAMETER_NAME>"'
      )
    )
  }

  const regex = /:[^/]\w+/
  const endpointMatchingRegex = new RegExp(
    `^${endpoint.endpoint.pattern.replace(regex, regex.source)}$`
  )

  await EndpointModel.find({
    'endpoint.pattern': {$regex: endpointMatchingRegex}
  }).then(result => {
    if (result.length > 0) {
      let duplicate = false
      result.forEach(existingEndpoint => {
        if (existingEndpoint.endpoint.method === endpoint.endpoint.method) {
          duplicate = true
        }
      })

      if (duplicate) {
        const error = new Error(
          `Duplicate error: HTTP method and regex created from endpoint pattern ${endpoint.endpoint.pattern} for matching requests already exists`
        )
        return next(error)
      }
    }

    return next()
  })
})

endpointSchema.index(
  {'endpoint.pattern': 1, 'endpoint.method': 1},
  {unique: true}
)

const EndpointModel = mongoose.model('endpoint', endpointSchema)

module.exports = EndpointModel
