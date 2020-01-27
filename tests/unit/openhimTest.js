'use strict'

const tap = require('tap')
const {constructOpenhimResponse} = require('../../src/openhim')

tap.test('constructOpenhimResponse()', {autoend: true}, t => {
  t.test('should create the response', t => {
    const timestamp = Date.now()
    const statusText = 'Successful'
    const headers = {'Content-Type': 'application/json'}
    const body = {message: 'success'}
    const status = 200
    const response = {
      headers,
      status,
      body,
      timestamp
    }
    const request = {
      headers,
      host: 'localhost',
      method: 'PUT',
      path: '/patient/',
      port: '8000',
      timestamp: Date.now()
    }

    const orchestrations = [
      {
        request,
        response,
        name: 'Patient'
      }
    ]

    const ctx = {
      orchestrations,
      response,
      statusText
    }

    const expectedResponse = {
      'x-mediator-urn': 'urn:mediator:generic_mapper',
      status: statusText,
      response: response,
      orchestrations: orchestrations
    }

    constructOpenhimResponse(ctx, timestamp)

    t.deepEqual(expectedResponse, JSON.parse(ctx.body))
    t.end()
  })
})
