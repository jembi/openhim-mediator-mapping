'use strict'

exports.getConfig = function() {
  return Object.freeze({
    port: process.env.SERVER_PORT || 3003,
    logLevel: process.env.LOG_LEVEL || 'info',
    openhim: Object.freeze({
      apiURL: process.env.OPENHIM_URL || 'https://localhost:8080',
      username: process.env.OPENHIM_USERNAME || 'root@openhim.org',
      password: process.env.OPENHIM_PASSWORD || 'openhim-password',
      trustSelfSigned: process.env.TRUST_SELF_SIGNED === 'true',
      register: process.env.OPENHIM_REGISTER || 'true'
    }),
    parser: Object.freeze({
      limit: process.env.PARSER_LIMIT || '1mb',
      xmlOptions: {
        trim: process.env.PARSER_XML_OPTIONS_TRIM || 'true',
        explicitRoot: process.env.PARSER_XML_OPTIONS_EXPLICIT_ROOT || 'false',
        explicitArray: process.env.PARSER_XML_OPTIONS_EXPLICIT_ARRAY || 'false'
      }
    }),
    validation: Object.freeze({
      nullable: process.env.ACCEPT_NULL_VALUES !== 'false',
      coerceTypes: process.env.VALIDATION_COERCE_TYPES || 'false'
    })
  })
}
