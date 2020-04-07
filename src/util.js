'use strict'

exports.parseStringToBoolean = (value, defaultValue) => {
  if (!value) return defaultValue

  switch (value.toLowerCase()) {
    case 'true':
      return true
    case 'false':
      return false
    default:
      return defaultValue
  }
}

exports.extractValueFromObject = (obj, path, def) => {
  /**
   * If the path is a string, convert it to an array
   * @param  {String|Array} path The path
   * @return {Array}             The path array
   */
  const stringToPath = function(path) {
    // If the path isn't a string, return it
    if (typeof path !== 'string') return path

    let output = []

    // Split to an array with dot notation
    path.split('.').forEach(function(item) {
      // Split to an array with bracket notation
      item.split(/\[([^}]+)\]/g).forEach(function(key) {
        // Push to the new array
        if (key.length > 0) {
          output.push(key)
        }
      })
    })

    return output
  }

  path = stringToPath(path)

  // Cache the current object
  let current = obj

  // For each item in the path, dig into the object
  for (let i = 0; i < path.length; i++) {
    // If the item isn't found, return the default (or null)
    if (!current[path[i]]) return def

    // Otherwise, update the current  value
    current = current[path[i]]
  }

  return current
}

exports.handleServerError = (ctx, operationFailureMsg, error, logger) => {
  ctx.status = 500
  const err = `${operationFailureMsg}${error.message}`
  ctx.body = {error: err}
  logger.error(err)
}

exports.validateEndpoint = body => {
  const validationError = 'Endpoint validation error: '

  if (!body) return `${validationError}invalid endpoint object`
  if (!body.name) return `${validationError}name missing`
  if (!body.endpoint || !body.endpoint.pattern) {
    return `${validationError}pattern missing`
  }
  if (!body.transformation) {
    return `${validationError}transformation input type missing`
  }
  if (!body.transformation.input) {
    return `${validationError}transformation input type missing`
  }
  if (!body.transformation.output) {
    return `${validationError}transformation output type missing`
  }
  return null
}
