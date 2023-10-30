'use strict'

const tap = require('tap')

const {createOrchestration, setStatusText} = require('../../src/orchestrations')

tap.test('createOrchestrations()', {autoend: true}, t => {
  t.test("should fail when request's timestamp is falsy", t => {
    t.plan(1)

    const request = {
      url: 'http://localhost',
      method: 'PUT'
    }
    const reqTimestamp = null
    const name = 'Test'

    try {
      createOrchestration(request, null, reqTimestamp, null, name)
    } catch (error) {
      t.equal(
        error.message,
        'Orchestration creation failed: required parameter not supplied - reqTimestamp | orchestrationName'
      )
    }
  })

  t.test('should fail when orchestration name is not supplied', t => {
    t.plan(1)

    const request = {
      url: 'http://localhost',
      method: 'PUT'
    }
    const reqTimestamp = Date.now()
    const name = null

    try {
      createOrchestration(request, null, reqTimestamp, null, null, name)
    } catch (error) {
      t.equal(
        error.message,
        'Orchestration creation failed: required parameter not supplied - reqTimestamp | orchestrationName'
      )
    }
  })

  t.test('should create orchestration', t => {
    const headers = {'Content-Type': 'application/json'}
    const requestBody = {surname: 'raze'}
    const request = {
      url: 'http://localhost:8000/patient/?name=brainman',
      method: 'PUT',
      headers,
      data: requestBody,
      params: {
        id: 1233
      }
    }
    const reqTimestamp = Date.now()

    const response = {
      body: {
        name: 'brainman',
        surname: 'raze'
      },
      status: 200,
      headers
    }
    const responseTimestamp = Date.now()
    const name = 'Test'

    const expectedOrch = {
      request: {
        host: 'localhost',
        port: 8000,
        path: '/patient/',
        timestamp: reqTimestamp,
        method: 'PUT',
        queryString: 'name=brainman&id=1233',
        headers,
        body: JSON.stringify(requestBody)
      },
      response: {
        timestamp: responseTimestamp,
        status: 200,
        headers: headers,
        body: JSON.stringify({
          name: 'brainman',
          surname: 'raze'
        })
      },
      name
    }

    const orchestration = createOrchestration(
      request,
      response,
      reqTimestamp,
      responseTimestamp,
      name,
      null
    )

    t.same(expectedOrch, orchestration)
    t.end()
  })

  t.test('setStatusText()', {autoend: true}, t => {
    t.test('should set the status to Failed', t => {
      const ctx = {
        routerResponseStatuses: ['primaryReqFailError']
      }

      setStatusText(ctx)

      t.equal(ctx.statusText, 'Failed')
      t.end()
    })

    t.test('should set the status to Completed with error(s)', t => {
      const ctx = {
        routerResponseStatuses: ['secondaryFailError']
      }

      setStatusText(ctx)

      t.equal(ctx.statusText, 'Completed with error(s)')
      t.end()
    })

    t.test('should set the status to Completed (from primaryCompleted)', t => {
      const ctx = {
        routerResponseStatuses: ['primaryCompleted']
      }

      setStatusText(ctx)

      t.equal(ctx.statusText, 'Completed')
      t.end()
    })

    t.test(
      'should set the status to Completed (from secondaryCompleted)',
      t => {
        const ctx = {
          routerResponseStatuses: ['secondaryCompleted']
        }

        setStatusText(ctx)

        t.equal(ctx.statusText, 'Completed')
        t.end()
      }
    )

    t.test('should set the status to Successful', t => {
      const ctx = {}

      setStatusText(ctx)

      t.equal(ctx.statusText, 'Successful')
      t.end()
    })
  })
})
