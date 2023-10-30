'use strict'

const {EventEmitter} = require('events')
const sinon = require('sinon')
const tap = require('tap')
const mediatorUtils = require('openhim-mediator-utils')

const logger = require('../../src/logger')

const {constructOpenhimResponse, mediatorSetup} = require('../../src/openhim')

tap.test('constructOpenhimResponse()', {autoend: true}, t => {
  let sandbox = sinon.createSandbox()
  t.beforeEach(done => {
    sandbox.restore()
    done()
  })

  t.afterEach(async () => {
    sandbox.restore()
  })

  t.test('registerMediator should call callback with error', t => {
    t.plan(1)
    sandbox.stub(mediatorUtils, 'registerMediator').yields(new Error('Boom'))
    try {
      mediatorSetup()
    } catch (error) {
      t.equal(error.message, 'Boom')
    }
  })

  t.test('registerMediator should setup openhim heartbeat listener', t => {
    t.plan(1)

    const emitter = new EventEmitter()

    sandbox.stub(mediatorUtils, 'registerMediator').yields(null)
    sandbox.stub(mediatorUtils, 'activateHeartbeat').returns(emitter)
    const loggerStub = sandbox.stub(logger, 'error')

    try {
      mediatorSetup()
      emitter.emit('error', 'Boom!')
      t.ok(loggerStub.called)
    } catch (error) {
      t.fail(`Should not reach here... ${error.message}`)
    }
  })

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
        response: {
          headers,
          status,
          body: JSON.stringify(body),
          timestamp
        },
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
      response: {
        headers,
        status,
        body: JSON.stringify(body),
        timestamp
      },
      orchestrations: orchestrations
    }

    constructOpenhimResponse(ctx, timestamp)

    t.same(JSON.parse(ctx.body), expectedResponse)
    t.end()
  })
})
