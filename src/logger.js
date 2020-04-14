'use strict'

const pino = require('pino')

const config = require('./config').getConfig()

const logger = pino({
  level: config.logLevel,
  prettyPrint: {
    colorize: true,
    translateTime: 'sys:UTC:yyyy-mm-dd"T"HH:MM:ss:l"Z"',
    ignore: 'pid,hostname'
  },
  serializers: {
    err: pino.stdSerializers.err
  },
  enabled: config.enableLogging
})

module.exports = logger
