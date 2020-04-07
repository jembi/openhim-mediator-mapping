const mongoose = require('mongoose')

const logger = require('../logger')

exports.open = async mongoUrl => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false
    })
    logger.info(`Connected to mongo on ${mongoUrl}`)
  } catch (err) {
    logger.error(`Failed to connect to mongo. Caused by: ${err.message}`, err)
    throw err
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
    throw err
  }
}
