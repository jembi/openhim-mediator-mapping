'use strict'

const objectMapper = require('object-mapper')

module.exports = function (input, map) {
  return objectMapper(input, map)
}

