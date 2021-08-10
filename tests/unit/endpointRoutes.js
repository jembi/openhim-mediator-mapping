'use strict'

const rewire = require('rewire')
const sinon = require('sinon')
const tap = require('tap')

const endpointService = require('../../src/db/services/endpoints')

const routes = rewire('../../src/endpointRoutes')

const createEndpointRoute = routes.__get__('createEndpointRoute')
const readEndpointRoute = routes.__get__('readEndpointRoute')
const readEndpointsRoute = routes.__get__('readEndpointsRoute')
const updateEndpointRoute = routes.__get__('updateEndpointRoute')
const deleteEndpointRoute = routes.__get__('deleteEndpointRoute')

tap.test('Endpoint Routes', {autoend: true}, async t => {
  let sandbox = sinon.createSandbox()
  t.beforeEach(done => {
    sandbox.restore()
    done()
  })

  t.afterEach(async () => {
    sandbox.restore()
  })

  // t.teardown(async () => {
  //   //await endpointService.deleteEndpoints({})
  // })

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
        error: 'Endpoint with ID 5e99568a50902917f2bc352b does not exist'
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
            'Retrieving of endpoint failed: Endpoint ID supplied in url is invalid'
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

  t.test('readEndpointsRoute should find endpoints', t => {
    t.plan(2)
    const result = [
      {
        name: 'test1',
        endpoint: {
          pattern: 'test1'
        }
      },
      {
        name: 'test2',
        endpoint: {
          pattern: 'test2'
        }
      }
    ]

    sandbox.stub(endpointService, 'readEndpoints').withArgs({}).resolves(result)

    const ctx = {
      request: {
        query: {},
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

    readEndpointsRoute(router)
  })

  t.test('readEndpointsRoute should reject promise', t => {
    t.plan(2)
    sandbox.stub(endpointService, 'readEndpoints').rejects(new Error('Boom!'))

    const ctx = {
      request: {
        query: {},
        body: {}
      }
    }
    const next = () => {
      t.equals(ctx.status, 500)
      t.deepEquals(ctx.body, {error: 'Retrieving of endpoints failed: Boom!'})
    }
    const router = {
      get: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    readEndpointsRoute(router)
  })

  t.test('readEndpointsRoute should throw', t => {
    t.plan(2)
    sandbox.stub(endpointService, 'readEndpoints').throws(new Error('Boom!'))

    const ctx = {
      request: {
        query: {},
        body: {}
      }
    }
    const next = () => {
      t.equals(ctx.status, 500)
      t.deepEquals(ctx.body, {error: 'Retrieving of endpoints failed: Boom!'})
    }
    const router = {
      get: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    readEndpointsRoute(router)
  })

  t.test('updateEndpointRoute should update endpoint', t => {
    t.plan(3)
    const result = {
      name: 'test1',
      endpoint: {
        pattern: 'test1'
      }
    }

    const stub = sandbox
      .stub(endpointService, 'updateEndpoint')
      .resolves(result)

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      },
      request: {
        query: {},
        body: {
          name: 'test1',
          endpoint: 'test1'
        }
      }
    }
    const next = () => {
      t.equals(ctx.status, 200)
      t.deepEquals(ctx.body, result)
      t.ok(stub.called)
    }
    const router = {
      put: (_pattern, _parser, callback) => {
        callback(ctx, next)
      }
    }

    updateEndpointRoute(router)
  })

  t.test('updateEndpointRoute should throw with invalid ObjectId', t => {
    t.plan(2)
    const ctx = {
      params: {
        endpointId: 'Invalid'
      },
      request: {
        body: {
          name: 'test1'
        }
      }
    }
    const next = () => {
      t.equals(ctx.status, 400)
      t.deepEquals(ctx.body, {
        error:
          'Updating of endpoint failed: Endpoint ID supplied in url is invalid'
      })
    }
    const router = {
      put: (_pattern, _parser, callback) => {
        callback(ctx, next)
      }
    }

    updateEndpointRoute(router)
  })

  t.test(
    'updateEndpointRoute should fail when no request body data supplied',
    t => {
      t.plan(2)
      const ctx = {
        params: {
          endpointId: '5e99568a50902917f2bc352b'
        },
        request: {
          query: {},
          body: {}
        }
      }
      const next = () => {
        t.equals(ctx.status, 400)
        t.deepEquals(ctx.body, {
          error: 'Updating of endpoint failed: Invalid endpoint object'
        })
      }
      const router = {
        put: (_pattern, _parser, callback) => {
          callback(ctx, next)
        }
      }

      updateEndpointRoute(router)
    }
  )

  t.test(
    'updateEndpointRoute should fail to update endpoint when endpoint not found',
    t => {
      t.plan(3)
      const stub = sandbox
        .stub(endpointService, 'updateEndpoint')
        .resolves(null)

      const ctx = {
        params: {
          endpointId: '5e99568a50902917f2bc352b'
        },
        request: {
          query: {},
          body: {
            name: 'test1',
            endpoint: 'test1'
          }
        }
      }
      const next = () => {
        t.equals(ctx.status, 404)
        t.deepEquals(ctx.body, {
          error: 'Endpoint with ID 5e99568a50902917f2bc352b does not exist'
        })
        t.ok(stub.called)
      }
      const router = {
        put: (_pattern, _parser, callback) => {
          callback(ctx, next)
        }
      }

      updateEndpointRoute(router)
    }
  )

  t.test('updateEndpointRoute should reject', t => {
    t.plan(3)
    const stub = sandbox
      .stub(endpointService, 'updateEndpoint')
      .rejects(new Error('MongoDB Error Detected'))

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      },
      request: {
        query: {},
        body: {
          name: 'test1',
          endpoint: 'test1'
        }
      }
    }
    const next = () => {
      t.equals(ctx.status, 400)
      t.deepEquals(ctx.body, {
        error: 'Updating of endpoint failed: MongoDB Error Detected'
      })
      t.ok(stub.called)
    }
    const router = {
      put: (_pattern, _parser, callback) => {
        callback(ctx, next)
      }
    }

    updateEndpointRoute(router)
  })

  t.test('deleteEndpointRoute should delete endpoint', t => {
    t.plan(2)
    const result = {
      deletedCount: 1
    }

    sandbox.stub(endpointService, 'deleteEndpoint').resolves(result)

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      }
    }
    const next = () => {
      t.equals(ctx.status, 200)
      t.deepEquals(ctx.body, {
        message: "Endpoint with ID '5e99568a50902917f2bc352b' deleted"
      })
    }
    const router = {
      delete: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    deleteEndpointRoute(router)
  })

  t.test('deleteEndpointRoute should throw with invalid ObjectId', t => {
    t.plan(2)
    const ctx = {
      params: {
        endpointId: 'Invalid'
      }
    }
    const next = () => {
      t.equals(ctx.status, 400)
      t.deepEquals(ctx.body, {
        error:
          'Endpoint deletion failed: Endpoint ID supplied in url is invalid'
      })
    }
    const router = {
      delete: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    deleteEndpointRoute(router)
  })

  t.test('deleteEndpointRoute should fail when endpoint not found', t => {
    t.plan(2)

    sandbox.stub(endpointService, 'deleteEndpoint').resolves(null)

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      }
    }
    const next = () => {
      t.equals(ctx.status, 404)
      t.deepEquals(ctx.body, {
        error: "Endpoint with ID '5e99568a50902917f2bc352b' does not exist"
      })
    }
    const router = {
      delete: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    deleteEndpointRoute(router)
  })

  t.test('deleteEndpointRoute should reject', t => {
    t.plan(2)

    sandbox
      .stub(endpointService, 'deleteEndpoint')
      .rejects(new Error('Mongo Error Detected!'))

    const ctx = {
      params: {
        endpointId: '5e99568a50902917f2bc352b'
      }
    }
    const next = () => {
      t.equals(ctx.status, 500)
      t.deepEquals(ctx.body, {
        error: 'Endpoint deletion failed: Mongo Error Detected!'
      })
    }
    const router = {
      delete: (_pattern, callback) => {
        callback(ctx, next)
      }
    }

    deleteEndpointRoute(router)
  })
})
