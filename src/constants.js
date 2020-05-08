'use strict'

exports.ALLOWED_CONTENT_TYPES = ['JSON', 'XML']

exports.ALLOWED_HTTP_METHODS = ['PUT', 'POST', 'DELETE', 'GET']

exports.DEFAULT_ENDPOINT_METHOD = 'POST'

// This regex only permits strings with URI safe characters.
// It also prevents the path starting with the string 'endpoints' as this is a reserved api path
exports.MIDDLEWARE_PATH_REGEX = /^(?!\/endpoints|\/uptime)\/[\d\w-._~]+$/

exports.MONGOOSE_STRING_TIMESTAMP_REGEX = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])\.([0-9]+)?(Z)?$/
