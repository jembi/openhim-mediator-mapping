'use strict'

const rewire = require('rewire')
const sinon = require('sinon')
const tap = require('tap')

const endpointService = require('../../src/db/services/endpoints')

const routes = rewire('../../src/endpointRoutes')

const createEndpointRoute = routes.__get__('createEndpointRoute')

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
})
