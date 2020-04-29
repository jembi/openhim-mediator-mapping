'use strict'

const rewire = require('rewire')
const sinon = require('sinon')
const tap = require('tap')

const endpointService = require('../../src/db/services/endpoints')

const routes = rewire('../../src/endpointRoutes')

const createEndpointRoute = routes.__get__('createEndpointRoute')
const readEndpointRoute = routes.__get__('readEndpointRoute')

tap.test('Endpoint Routes', {autoend: true}, async t => {
  let sandbox = sinon.createSandbox()
  t.beforeEach(done => {
    sandbox.restore()
    done()
  })

  t.afterEach(async () => {
    sandbox.restore()
  })

  t.teardown(async () => {
    await endpointService.deleteEndpoints({})
  })

  t.test('createEndpointRoute should create endpoint', t => {
    t.plan(2)
    const result = {
      name: 'test',
      endpoint: {
        pattern: 'test'
      }
    }

    sandbox.stub(endpointService, 'createEndpoint').resolves(result)

    const ctx = {
      request: {
        body: {}
      }
    }
    const next = () => {
      t.equals(ctx.status, 201)
      t.deepEquals(ctx.body, result)
    }
    const router = {
      post: (_pattern, _parser, callback) => {
        callback(ctx, next)
      }
    }

    createEndpointRoute(router)
  })

  t.test(
    'createEndpointRoute should reject with error when trying to create endpoint',
    t => {
      t.plan(2)

      sandbox
        .stub(endpointService, 'createEndpoint')
        .rejects(new Error('Boom!'))

      const ctx = {
        request: {
          body: {}
        }
      }
      const next = () => {
        t.equals(ctx.status, 400)
        t.deepEquals(ctx.body, {error: 'Create endpoint failed:Boom!'})
      }
      const router = {
        post: (_pattern, _parser, callback) => {
          callback(ctx, next)
        }
      }

      createEndpointRoute(router)
    }
  )

  t.test(
    'createEndpointRoute should throw error when trying to create endpoint',
    t => {
      t.plan(2)

      sandbox.stub(endpointService, 'createEndpoint').throws(new Error('Boom!'))

      const ctx = {
        request: {
          body: {}
        }
      }
      const next = () => {
        t.equals(ctx.status, 500)
        t.deepEquals(ctx.body, {error: 'Create endpoint failed:Boom!'})
      }
      const router = {
        post: (_pattern, _parser, callback) => {
          callback(ctx, next)
        }
      }

      createEndpointRoute(router)
    }
  )

  t.test('readEndpointRoute should find endpoint', t => {
    t.plan(2)
    const result = {
      name: 'test',
      endpoint: {
        pattern: 'test'
      }
    }

    sandbox.stub(endpointService, 'readEndpoint').resolves(result)

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      },
      request: {
        body: {}
      }
    }
    const next = () => {
      t.equals(ctx.status, 200)
      t.deepEquals(ctx.body, result)
    }
    const router = {
      get: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    readEndpointRoute(router)
  })

  t.test('readEndpointRoute should not find endpoint', t => {
    t.plan(2)

    sandbox.stub(endpointService, 'readEndpoint').resolves(null)

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      },
      request: {
        body: {}
      }
    }
    const next = () => {
      t.equals(ctx.status, 404)
      t.deepEquals(ctx.body, {
        error: 'Endpoint with id 5e99568a50902917f2bc352b does not exist'
      })
    }
    const router = {
      get: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    readEndpointRoute(router)
  })

  t.test(
    'readEndpointRoute should reject whilst trying to read endpoint',
    t => {
      t.plan(2)

      sandbox
        .stub(endpointService, 'readEndpoint')
        .rejects(new Error('MongoDB Error detected'))

      const ctx = {
        params: {
          endpointId: '5e99568a50902917f2bc352b'
        },
        request: {
          body: {}
        }
      }
      const next = () => {
        t.equals(ctx.status, 500)
        t.deepEquals(ctx.body, {
          error: 'Retrieving of endpoint failed: MongoDB Error detected'
        })
      }
      const router = {
        get: (_pattern, callback) => {
          callback(ctx, next)
        }
      }

      readEndpointRoute(router)
    }
  )

  t.test(
    'readEndpointRoute should throw error is endpoint is not an Object ID',
    t => {
      t.plan(2)

      sandbox
        .stub(endpointService, 'readEndpoint')
        .rejects(new Error('MongoDB Error detected'))

      const ctx = {
        params: {
          endpointId: 'Invalid'
        },
        request: {
          body: {}
        }
      }
      const next = () => {
        t.equals(ctx.status, 400)
        t.deepEquals(ctx.body, {
          error:
            'Retrieving of endpoint failed: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
        })
      }
      const router = {
        get: (_pattern, callback) => {
          callback(ctx, next)
        }
      }

      readEndpointRoute(router)
    }
  )
})
