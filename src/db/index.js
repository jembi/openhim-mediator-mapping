const mongoose = require('mongoose')

const config = require('../config').getConfig()
const logger = require('../logger')

exports.open = async () => {
  try {
    await mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false
    })
    logger.info(`Connected to mongo on ${config.mongoUrl}`)
  } catch (err) {
    logger.error(`Failed to connect to mongo. Caused by: ${err.message}`, err)
  }
}
