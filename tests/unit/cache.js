'use strict'

const {EventEmitter} = require('events')
const sinon = require('sinon')
const sleep = require('util').promisify(setTimeout)
const tap = require('tap')

const EndpointModel = require('../../src/db/models/endpoints')
const endpointService = require('../../src/db/services/endpoints')
const logger = require('../../src/logger')

const cache = require('../../src/db/services/endpoints/cache')

tap.test('Endpoint Cache', {autoend: true}, t => {
  let sandbox = sinon.createSandbox()
  t.beforeEach(done => {
    sandbox.restore()
    done()
  })

  t.afterEach(async () => {
    sandbox.restore()
  })

  t.test('should setup the event listeners', t => {
    t.plan(2)

    const emitter = new EventEmitter()

    const modelWatchStub = sandbox.stub(EndpointModel, 'watch').returns(emitter)

    cache.setupEventListeners()

    t.ok(modelWatchStub.calledOnce)
    t.deepEquals(Object.keys(emitter._events), ['change', 'end', 'error'])
  })

  t.test('should listen for error events', t => {
    t.plan(2)

    const emitter = new EventEmitter()

    const modelWatchStub = sandbox.stub(EndpointModel, 'watch').returns(emitter)

    const loggerStub = sandbox.stub(logger, 'fatal').returns(emitter)

    cache.setupEventListeners()

    emitter.emit('error', 'Boom!')

    t.ok(modelWatchStub.calledOnce)
    t.ok(loggerStub.calledOnce)
  })

  t.test('should listen for end events', t => {
    t.plan(2)

    const emitter = new EventEmitter()

    const modelWatchStub = sandbox.stub(EndpointModel, 'watch').returns(emitter)

    const loggerStub = sandbox.stub(logger, 'fatal').returns(emitter)

    cache.setupEventListeners()

    emitter.emit('end', 'Boom!')

    t.ok(modelWatchStub.calledOnce)
    t.ok(loggerStub.calledOnce)
  })

  t.test('should listen for change event and update cache', async t => {
    t.plan(6)
    t.equals(cache.endpointCache.length, 0)

    const emitter = new EventEmitter()

    const modelWatchStub = sandbox.stub(EndpointModel, 'watch').returns(emitter)
    const readEndpointStub = sandbox
      .stub(endpointService, 'readEndpoints')
      .resolves(['1'])
    sandbox.spy(cache.endpointCache)

    cache.setupEventListeners()

    t.deepEquals(Object.keys(emitter._events), ['change', 'end', 'error'])

    emitter.emit('change', {
      documentKey: {_id: '1234'},
      operationType: 'update'
    })

    // The populate step is asynchronous therefore we should wait to make sure
    // we don't try check the function was called before it has had a chance.
    await sleep(1000)

    t.ok(modelWatchStub.calledOnce)
    t.ok(readEndpointStub.calledOnce)
    t.ok(cache.endpointCache.splice.calledOnce)
    t.ok(cache.endpointCache.push.calledOnce)
  })

  t.test('should remove endpoint event listeners', t => {
    t.plan(3)

    const emitter = new EventEmitter()

    const modelWatchStub = sandbox.stub(EndpointModel, 'watch').returns(emitter)

    cache.setupEventListeners()
    t.deepEquals(Object.keys(emitter._events), ['change', 'end', 'error'])

    cache.removeEventListeners()
    t.notOk(Object.keys(emitter._events).length)

    t.ok(modelWatchStub.calledOnce)
  })
})
