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

exports.extractValueFromObject = (obj, path, defaultValue) => {
  /**
   * If the path is a string, convert it to an array
   * @param  {String|Array} path The path
   * @return {Array}             The path array
   */
  const stringToPath = function (path) {
    // If the path isn't a string, return it
    if (typeof path !== 'string') return path

    let output = []

    // Split to an array with dot notation
    path.split('.').forEach(function (item) {
      // Split to an array with bracket notation
      item.split(/\[([^}]+)\]/g).forEach(function (key) {
        // Push to the new array
        if (key.length > 0) {
          output.push(key)
        }
      })
    })

    return output
  }

  if (!obj) {
    return null
  }

  path = stringToPath(path)

  // Cache the current object
  let current = obj

  // For each item in the path, dig into the object
  for (let i = 0; i < path.length; i++) {
    // If the item isn't found, return the default (or null)
    if (!current[path[i]]) return defaultValue

    // Otherwise, update the current  value
    current = current[path[i]]
  }

  return current
}

exports.handleServerError = (ctx, operationFailureMsg, error, logger) => {
  ctx.status = ctx.statusCode ? ctx.statusCode : 500
  const err = `${operationFailureMsg}${error.message}`
  ctx.body = {error: err}
  logger.error(err)
}

const extractRegexFromPattern = pattern => {
  if (pattern[0] === '/') {
    pattern = pattern.substring(1)
  }

  const splitPattern = pattern.split('/')
  let regexString = ''
  const urlParamRegexPart = new RegExp(/[^ ;:=#@,/]{1,}/)

  splitPattern.forEach(item => {
    if (item && item[0] === ':') {
      regexString += `\\/(?<${item.substring(1)}>${urlParamRegexPart.source})`
    } else {
      regexString += `\\/${item}`
    }
  })
  regexString += '$'

  return regexString
}

exports.extractRegexFromPattern = extractRegexFromPattern

exports.extractUrlParamsFromUrlPath = (path, pattern) => {
  const urlParams = {}

  if (!path || !pattern) return urlParams

  const match = path.match(extractRegexFromPattern(pattern))

  return match && match.groups ? match.groups : urlParams
}
