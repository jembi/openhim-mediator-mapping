'use strict'

exports.ALLOWED_CONTENT_TYPES = ['JSON', 'XML']

// This regex only permits strings with URI safe characters.
// It also prevents the path starting with the string 'endpoints' as this is a reserved api path
exports.MIDDLEWARE_PATH_REGEX = /^(?!\/endpoints)\/[\d\w-._~]+$/
