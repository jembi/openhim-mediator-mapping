'use strict'

const StateModel = require('../../models/states')

exports.createEndpointState = state => {
  const stateObject = new StateModel(state)
  return stateObject.save({checkKeys: false})
}

const createFilterObject = (
  endpointId,
  networkErrorFilters,
  httpStatusFilters
) => {
  const searchConditions = {
    _endpointReference: endpointId
  }

  if (networkErrorFilters === 'include') {
    searchConditions.networkError = true
  } else if (networkErrorFilters === 'exclude') {
    searchConditions.networkError = false
  }

  if (httpStatusFilters.length > 0 && !httpStatusFilters.includes('*')) {
    const mongoFilterArray = []

    for (const pattern of httpStatusFilters) {
      const validRange = pattern.match(/\d+?(?=xx)/g)
      if (validRange) {
        mongoFilterArray.push({
          httpStatus: {
            $gte: Number(validRange[0] * 100),
            $lt: (Number(validRange[0]) + 1) * 100
          }
        })
      } else if (pattern.match(/^[1-5]\d\d$/)) {
        mongoFilterArray.push({
          httpStatus: Number(pattern)
        })
      } else {
        throw new Error('Invalid HTTP Status filter')
      }
    }

    searchConditions.$or = mongoFilterArray
  }

  return searchConditions
}

exports.readLatestEndpointStateById = (
  endpointId,
  networkErrorFilters,
  httpStatusFilters
) => {
  return StateModel.findOne(
    createFilterObject(endpointId, networkErrorFilters, httpStatusFilters),
    {},
    {sort: {createdAt: -1}}
  ).exec()
}
