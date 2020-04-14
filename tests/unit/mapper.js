'use strict'

const tap = require('tap')

const {createMappedObject} = require('../../src/middleware/mapper')

tap.test('Mapper', {autoend: true}, t => {
  t.test('createMappedObject()', {autoend: true}, t => {
    t.test('should throw when mapping schema is not supplied', t => {
      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }

      t.throws(
        () => createMappedObject(ctx),
        'Testing endpoint (randomUidForRequest): No mapping schema supplied'
      )
      t.end()
    })

    t.test('should create an object based on mapping', t => {
      const body = {
        inputOne: 1,
        inputTwo: 2,
        inputThree: 3
      }
      const ctx = {
        request: {
          body
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
<<<<<<< HEAD:tests/unit/mapperTest.js
            name: 'Testing endpoint'
          },
          allData: {
            requestBody: body
=======
            name: 'Testing endpoint',
            inputMapping: {
              'requestBody.inputOne': 'outputOne',
              'requestBody.inputTwo': 'outputTwo',
              'requestBody.inputThree': 'outputThree'
            }
>>>>>>> c414f44dc51f50e036f0c0cfa6b5200c3f70638e:tests/unit/mapper.js
          }
        }
      }

      const expected = {
        outputOne: 1,
        outputTwo: 2,
        outputThree: 3
      }

      createMappedObject(ctx)

      t.deepEqual(ctx.body, expected)
      t.end()
    })
  })
})
