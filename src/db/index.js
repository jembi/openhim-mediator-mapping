'use strict'

const mongoose = require('mongoose')

const logger = require('../logger')

const {dynamicEndpoints} = require('../config').getConfig()
const {
  removeEventListeners,
  setupEventListeners
} = require('./services/endpoints/cache')

exports.open = mongoUrl => {
  return mongoose
    .connect(mongoUrl, {
      poolSize: 20,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
    .then(connection => {
      logger.info(`Connected to mongo on ${mongoUrl}`)
      if (dynamicEndpoints) {
        setupEventListeners()
      }
      return connection
    })
    .catch(error => {
      logger.error(
        `Failed to connect to mongo. Caused by: ${error.message}`,
        error
      )
      throw error
    })
}

exports.close = async () => {
  if (dynamicEndpoints) {
    removeEventListeners()
  }
  await mongoose
    .disconnect()
    .then(() => {
      logger.info(`Closed DB connection.`)
    })
    .catch(error => {
      logger.error(
        `Failed to close DB connection. Caused by: ${error.message}`,
        error
      )
      throw error
    })
}

// TODO: Add DB connection listeners to Mongoose Connection.
// This will be useful for reconnecting to Mongo after an error
// and re-establishing the dynamic endpoint functionality without
// having to restart the Mapping mediator (resulting in downtime)
// These Connection Listeners would work to re-enable the Event
// Change listeners
// https://mongoosejs.com/docs/connections.html#connection-events
