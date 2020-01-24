'use strict'

const rewire = require('rewire')
const tap = require('tap')

const externalRequests = rewire('../../src/middleware/externalRequests')

tap.test('External Requests Middleware', {autoend: true}, t => {
  t.test('prepareLookupRequests', {autoend: true}, t => {
    t.test('should throw an error if any promise in the array fails', t => {
      t.plan(2)

      const performRequestsStub = externalRequests.__set__(
        'performRequests',
        () => [Promise.resolve('Success'), Promise.reject('Fail')]
      )

      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint',
            requests: {
              lookup: [
                {
                  // first lookup request config - responds with success
                },
                {
                  // second lookup request config - responds with fail
                }
              ]
            }
          }
        }
      }

      const prepareLookupRequests = externalRequests.__get__(
        'prepareLookupRequests'
      )

      prepareLookupRequests(ctx)
        .then(() => {
          t.error('Should not reach here')
        })
        .catch(err => {
          performRequestsStub()
          t.throws(err, 'Error should be thrown when a promise rejects')
          t.same(err.message, 'Rejected Promise: Fail')
        })
    })

    t.test(
      'should add response data to the ctx when all promises resolve',
      t => {
        t.plan(1)

        const performRequestsStub = externalRequests.__set__(
          'performRequests',
          () => [
            Promise.resolve({test1: 'testA'}),
            Promise.resolve({test2: 'testB'})
          ]
        )

        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              requests: {
                lookup: [
                  {
                    // first lookup request config - responds with success
                  },
                  {
                    // second lookup request config - responds with success
                  }
                ]
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx)
          .then(() => {
            t.same({test1: 'testA', test2: 'testB'}, ctx.lookupRequests)
            performRequestsStub()
          })
          .catch(() => {
            t.error('Should not reach here')
          })
      }
    )

    t.test(
      'should not reach the request making function is there is no lookup config',
      t => {
        let called = false
        const performRequestsStub = externalRequests.__set__({
          performRequests: () => {
            called = true
          }
        })

        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint',
              requests: {
                // no lookup config
              }
            }
          }
        }

        const prepareLookupRequests = externalRequests.__get__(
          'prepareLookupRequests'
        )

        prepareLookupRequests(ctx)

        performRequestsStub()
        t.equals(called, false, 'performRequestsStub should not be called')
        t.end()
      }
    )
  })
})
