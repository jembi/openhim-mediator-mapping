const pino = require('pino')

const config = require('./config')
const configOptions = config.getConfig()

const logger = pino({
  level: configOptions.logLevel,
  prettyPrint: true,
  serializers: {
    err: pino.stdSerializers.err
  },
  enabled: configOptions.enableLogging
})

module.exports = exports = logger
