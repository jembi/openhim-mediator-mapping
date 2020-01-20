'use strict'

const tap = require('tap')
const {createOrchestration} = require('../../src/middleware/externalRequests')

tap.test('External Requests', {autoend: true}, t => {
  t.test('createOrchestration', {autoend: true}, t => {
    t.test("should fail when request's url or method is not supplied", t => {
      t.plan(1)

      const url = null
      const method = null

      try {
        createOrchestration(url, method, null, null, null, null, null, null)
      } catch (error) {
        t.equals(
          error.message,
          'Orchestration creation failed: url/method not supplied'
        )
      }
    })

    t.test("should fail when request's timestamp is not supplied", t => {
      t.plan(1)

      const url = 'http://localhost'
      const method = 'PUT'

      try {
        createOrchestration(url, method, null, null, null, null, null, null)
      } catch (error) {
        t.equals(error.message, 'Orchestration request timestamp not supplied')
      }
    })

    t.test('should fail when orchestration name is not supplied', t => {
      t.plan(1)

      const url = 'http://localhost'
      const method = 'PUT'
      const reqTimestamp = Date.now()

      try {
        createOrchestration(
          url,
          method,
          null,
          null,
          null,
          reqTimestamp,
          null,
          null
        )
      } catch (error) {
        t.equals(error.message, 'Orchestration name not supplied')
      }
    })
  })
})
