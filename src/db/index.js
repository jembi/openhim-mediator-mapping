'use strict'

const mongoose = require('mongoose')

const logger = require('../logger')

const {dynamicEndpoints} = require('../config').getConfig()
const {
  removeEventListeners,
  setupEventListeners
} = require('./services/endpoints/cache')

let reconnectPromise = null
let eventListenersSet = false
let mongooseConnection = function (mongoUrl) {
  return mongoose
    .connect(mongoUrl, {
      poolSize: 20,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
    .then(connection => {
      return connection
    })
    .catch(error => {
      logger.error(
        `Failed to connect to mongo. Caused by: ${error.message}`,
        error
      )
      if (!reconnectPromise) throw error
    })
}

exports.open = mongoUrl => {
  mongoose.connection.on('disconnected', () => {
    if (
      mongoose.connection._hasOpened === true &&
      mongoose.connection._closeCalled !== true
    ) {
      if (!reconnectPromise) {
        reconnectPromise = mongooseConnection(mongoUrl)
      }
    }
  })
  mongoose.connection.on('connected', () => {
    logger.info(`Connected to mongo on ${mongoUrl}`)
    if (dynamicEndpoints && !eventListenersSet) {
      setupEventListeners()
      eventListenersSet = true
    }
    if (reconnectPromise) {
      reconnectPromise = null
    }
  })
  return mongooseConnection(mongoUrl)
}

exports.close = async () => {
  if (dynamicEndpoints) {
    removeEventListeners()
    eventListenersSet = false
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
