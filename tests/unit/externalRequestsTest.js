'use strict'

const tap = require('tap')
const {
  createOrchestration,
  constructOpenhimResponse
} = require('../../src/middleware/externalRequests')

tap.test('External Requests', {autoend: true}, t => {
  t.test('createOrchestration', {autoend: true}, t => {
    t.test("should fail when request's url or method are falsy", t => {
      t.plan(1)

      const request = {
        url: null,
        method: null
      }

      try {
        createOrchestration(request, null, null, null, null, null)
      } catch (error) {
        t.equals(
          error.message,
          'Orchestration creation failed: url/method not supplied'
        )
      }
    })

    t.test("should fail when request's timestamp is falsy", t => {
      t.plan(1)

      const request = {
        url: 'http://localhost',
        method: 'PUT'
      }
      const reqTimestamp = null

      try {
        createOrchestration(request, null, null, reqTimestamp, null)
      } catch (error) {
        t.equals(error.message, 'Orchestration request timestamp not supplied')
      }
    })

    t.test('should fail when orchestration name is not supplied', t => {
      t.plan(1)

      const request = {
        url: 'http://localhost',
        method: 'PUT',
        id: null
      }
      const reqTimestamp = Date.now()

      try {
        createOrchestration(request, null, null, reqTimestamp, null, null)
      } catch (error) {
        t.equals(error.message, 'Orchestration name not supplied')
      }
    })

    t.test('should create orchestration', t => {
      const headers = {'Content-Type': 'application/json'}
      const request = {
        url: 'http://localhost:8000/patient/?name=brainman',
        method: 'PUT',
        id: 'Patient',
        headers
      }
      const reqTimestamp = Date.now()

      const requestBody = {surname: 'raze'}
      const response = {
        body: {
          name: 'brainman',
          surname: 'raze'
        },
        status: 200,
        headers
      }
      const responseTimestamp = Date.now()
      const name = 'Patient'

      const expectedOrch = {
        request: {
          host: 'localhost',
          port: '8000',
          path: '/patient/',
          timestamp: reqTimestamp,
          method: 'PUT',
          queryString: 'name=brainman',
          headers,
          body: requestBody
        },
        response: {
          timestamp: responseTimestamp,
          status: 200,
          headers: headers,
          body: {
            name: 'brainman',
            surname: 'raze'
          }
        },
        name
      }

      const orchestration = createOrchestration(
        request,
        requestBody,
        response,
        reqTimestamp,
        responseTimestamp
      )

      t.deepEqual(expectedOrch, orchestration)
      t.end()
    })
  })

  t.test('constructOpenhimResponse', {autoend: true}, t => {
    t.test('should create the response', t => {
      const ctx = {}
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

      const expectedResponse = `{
        "x-mediator-urn": "urn:mediator:generic_mapper",
        "status": "${statusText}",
        "response": ${JSON.stringify(response)},
        "orchestrations": ${JSON.stringify(orchestrations)}
      }`

      constructOpenhimResponse(
        ctx,
        response,
        orchestrations,
        statusText,
        timestamp
      )

      t.deepEqual(JSON.parse(expectedResponse), JSON.parse(ctx.body))
      t.end()
    })
  })
})
