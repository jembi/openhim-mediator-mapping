'use strict';

exports.getConfig = function() {
  return Object.freeze({
    port: process.env.SERVER_PORT || 3003,
    heartbeat: process.env.HEARTBEAT === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    openhim: Object.freeze({
      apiURL: process.env.OPENHIM_URL || 'https://localhost:8080',
      username: process.env.OPENHIM_USERNAME || 'root@openhim.org',
      password: process.env.OPENHIM_PASSWORD || 'openhim-password',
      trustSelfSigned: process.env.TRUST_SELF_SIGNED === 'true'
    })
  })
}