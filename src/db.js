const mongoose = require('mongoose')

const logger = require('./logger')
const EndpointModel = require('./models/endpoints')

exports.open = async mongoUrl => {
  try {
    await mongoose.connect(mongoUrl, {useNewUrlParser: true})
    logger.info(`Connected to mongo on ${mongoUrl}`)
  } catch (err) {
    logger.error(`Failed to connect to mongo. Caused by: ${err.message}`, err)
  }
}

exports.close = async () => {
  try {
    await mongoose.connection.close()
    logger.info(`Closed DB connection.`)
  } catch (err) {
    logger.error(
      `Failed to close DB connection. Caused by: ${err.message}`,
      err
    )
  }
}

exports.readEndpoints = (queryParams, desiredFields) => {
  try {
    return EndpointModel.find(queryParams, desiredFields)
  } catch (err) {
    logger.error(`Failed to read endpoints: ${err.message}`)
    throw err
  }
}

exports.createEndpoint = (endpointConfig, callback) => {
  const endpoint = new EndpointModel(endpointConfig)
  endpoint.save({checkKeys: false}, err => {
    if (err) {
      console.error(`Failed to CREATE Endpoint: ${err.message}`)
      return callback(err)
    }
    console.log(`Created Endpoint: ${endpointConfig.name}`)
    callback()
  })
}

exports.deleteEndpoints = (queryParams, callback) => {
  EndpointModel.deleteMany(queryParams, err => {
    if (err) {
      console.error(`Failed to DELETE Endpoints: ${err.message}`)
      throw err
    }
    console.debug('Deleted Endpoint')
    callback()
  })
}
