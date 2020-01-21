'use strict'

const sinon = require('sinon')
const tap = require('tap')

const externalRequests = require('../../src/middleware/externalRequests')

tap.test('External Requests Middleware', {autoend: true}, t => {
  t.test('prepareLookupRequests', {autoend: true}, t => {
    let performRequestsStub
    t.beforeEach(done => {
      performRequestsStub = sinon.stub(externalRequests, 'performRequests')
      done()
    })

    t.afterEach(done => {
      performRequestsStub.restore()
      done()
    })

    t.test(
      'should throw an error if any promise in the array fails',
      {autoend: true},
      t => {
        performRequestsStub
          .onFirstCall()
          .returns([Promise.resolve('Success'), Promise.reject('Fail')])

        const ctx = {
          state: {
            metaData: {
              requests: {
                lookup: [{}, {}]
              }
            }
          }
        }

        externalRequests.prepareLookupRequests(ctx).catch(err => {
          t.throws(err, 'test')
          t.end()
        })
      }
    )
  })
})
