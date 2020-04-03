'use strict'

const {parseStringToBoolean} = require('./util')

exports.getConfig = function() {
  return Object.freeze({
    port: process.env.SERVER_PORT || 3003,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableLogging: parseStringToBoolean(process.env.ENABLE_LOGGING, true),
    mongoUrl:
      process.env.MONGO_URL || 'mongodb://localhost:27017/mapping-mediator',
    openhim: Object.freeze({
      apiURL: process.env.OPENHIM_URL || 'https://localhost:8080',
      username: process.env.OPENHIM_USERNAME || 'root@openhim.org',
      password: process.env.OPENHIM_PASSWORD || 'openhim-password',
      trustSelfSigned: parseStringToBoolean(
        process.env.TRUST_SELF_SIGNED,
        true
      ),
      register: parseStringToBoolean(process.env.OPENHIM_REGISTER, true)
    }),
    parser: Object.freeze({
      limit: process.env.PARSER_LIMIT || '1mb',
      xmlOptions: {
        trim: parseStringToBoolean(process.env.PARSER_XML_OPTIONS_TRIM, true),
        explicitRoot: parseStringToBoolean(
          process.env.PARSER_XML_OPTIONS_EXPLICIT_ROOT,
          false
        ),
        explicitArray: parseStringToBoolean(
          process.env.PARSER_XML_OPTIONS_EXPLICIT_ARRAY,
          false
        )
      }
    }),
    validation: Object.freeze({
      nullable: parseStringToBoolean(
        process.env.VALIDATION_ACCEPT_NULL_VALUES,
        false
      ),
      coerceTypes:
        parseStringToBoolean(
          process.env.VALIDATION_COERCE_TYPES,
          process.env.VALIDATION_COERCE_TYPES
        ) || false
    })
  })
}
