'use strict'

const tap = require('tap')

const {updateEndpointState} = require('../../src/middleware/initiate')

const initialMetaData = {
  name: 'Sample Endpoint',
  endpoint: {
    pattern: '/sample'
  },
  transformation: {
    input: 'JSON',
    output: 'JSON'
  }
}
const initialCtx = {
  state: {
    uuid: '7asd596a5s0d5s0das0d7a5sd08'
  }
}

tap.test('Initiate Middleware', {autoend: true}, t => {
  t.test('updateEndpointState', {autoend: true}, t => {
    t.test('should throw when metaData has not been defined', async t => {
      t.plan(1)

      const metaData = null
      const ctx = Object.assign(initialCtx, {metaData})

      try {
        await updateEndpointState(ctx, metaData)
      } catch (error) {
        t.equal(
          error.message,
          'No metaData supplied for updating state for this endpoint'
        )
      }
    })

    t.test('should throw when metaData is an empty objectd', async t => {
      t.plan(1)

      const metaData = {}
      const ctx = Object.assign(initialCtx, {metaData})

      try {
        await updateEndpointState(ctx, metaData)
      } catch (error) {
        t.equal(
          error.message,
          'No metaData supplied for updating state for this endpoint'
        )
      }
    })

    t.test(
      'should not update state if nothing supplied in metaData.state',
      async t => {
        t.plan(1)

        const additionalMetaData = {}
        const metaData = Object.assign(initialMetaData, additionalMetaData)
        const ctx = {
          state: {
            metaData,
            uuid: '7asd596a5s0d5s0das0d7a5sd08'
          }
        }

        t.doesNotThrow(() => {
          updateEndpointState(ctx, metaData)
        })
      }
    )

    t.test(
      'should update the state for system properties - lastTimestamp',
      async t => {
        t.plan(1)

        const additionalMetaData = {
          state: {
            extract: {
              system: {
                lastTimestamp: true
              },
              requestBody: {},
              responseBody: {},
              query: {}
            },
            data: {
              system: {
                lastTimestamp: '2020-04-06T13:54:02Z'
              },
              requestBody: {},
              query: {}
            }
          }
        }
        const metaData = Object.assign(initialMetaData, additionalMetaData)
        const ctx = {
          state: {
            metaData,
            uuid: '7asd596a5s0d5s0das0d7a5sd08',
            allData: {
              timestamps: {}
            }
          }
        }

        await updateEndpointState(ctx, metaData)

        t.pass()
      }
    )
  })
})
