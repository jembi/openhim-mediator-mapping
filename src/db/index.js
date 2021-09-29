'use strict'

const mongoose = require('mongoose')
const {MONGOOSE_RECONNECT_INTERVAL} = require('../constants')

const logger = require('../logger')

const {dynamicEndpoints} = require('../config').getConfig()
const {
  removeEventListeners,
  setupEventListeners
} = require('./services/endpoints/cache')

let reconnectInterval
let eventListenersSet
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
      if (!reconnectInterval) throw error
    })
}

exports.open = mongoUrl => {
  mongoose.connection.on('disconnected', () => {
    //This might currently result in issues if the connection is intentionally disconnected
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        mongooseConnection(mongoUrl)
      }, MONGOOSE_RECONNECT_INTERVAL)
    }
  })
  mongoose.connection.on('connected', () => {
    logger.info(`Connected to mongo on ${mongoUrl}`)
    if (dynamicEndpoints && !eventListenersSet) {
      setupEventListeners()
      eventListenersSet = true
    }
    if (reconnectInterval) {
      clearInterval(reconnectInterval)
      reconnectInterval = null
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
