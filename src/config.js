'use strict'

const {parseStringToBoolean} = require('./util')

exports.getConfig = function () {
  return Object.freeze({
    port: process.env.SERVER_PORT || 3003,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableLogging: parseStringToBoolean(process.env.ENABLE_LOGGING, true),
    mongoUrl:
      process.env.MONGO_URL ||
      'mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set',
    openhim: Object.freeze({
      apiURL: process.env.OPENHIM_URL || 'https://localhost:8080',
      username: process.env.OPENHIM_USERNAME || 'root@openhim.org',
      password: process.env.OPENHIM_PASSWORD || 'openhim-password',
      trustSelfSigned: parseStringToBoolean(
        process.env.TRUST_SELF_SIGNED,
        true
      ),
      register: parseStringToBoolean(process.env.OPENHIM_REGISTER, true),
      urn: process.env.MEDIATOR_URN || 'urn:mediator:generic_mapper'
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
    }),
    dynamicEndpoints: parseStringToBoolean(process.env.DYNAMIC_ENDPOINTS, true),
    kafkaConfig: {
      brokers: process.env.KAFKA_BROKERS || 'kafka-01:9092',
      clientId: process.env.KAFKA_CLIENTID || 'mapping-mediator',
      requestTimeout: process.env.KAFKA_REQUEST_TIMEOUT || 60000,
      connectionTimeout: process.env.KAFKA_CONNECTION_TIMEOUT || 60000,
      groupId: process.env.KAFKA_CONSUMER_GROUPID || 'mappinng-mediator'
    }
  })
}
