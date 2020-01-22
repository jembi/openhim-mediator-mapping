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

    t.test('should throw an error if any promise in the array fails', t => {
      t.plan(1)
      performRequestsStub
        .onFirstCall()
        .returns([Promise.resolve('Success'), Promise.reject('Fail')])

      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint',
            requests: {
              lookup: [{}, {}]
            }
          }
        }
      }

      externalRequests
        .prepareLookupRequests(ctx)
        .then(() => {
          t.error('Should not reach here')
        })
        .catch(err => {
          t.throws(err, 'Error should be thrown when a promise rejects')
        })
    })
  })
})
