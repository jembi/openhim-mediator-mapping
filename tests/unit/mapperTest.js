'use strict'

const rewire = require('rewire')
const tap = require('tap')

const mapper = rewire('../../src/middleware/mapper')
const createMappedObject = mapper.__get__('createMappedObject')

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

    t.test(
      'should create an object based on mapping (from request body)',
      t => {
        const ctx = {
          request: {
            body: {
              inputOne: 1,
              inputTwo: 2,
              inputThree: 3
            }
          },
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            }
          }
        }

        const mappingSchema = {
          'requestBody.inputOne': 'outputOne',
          'requestBody.inputTwo': 'outputTwo',
          'requestBody.inputThree': 'outputThree'
        }

        const expected = {
          outputOne: 1,
          outputTwo: 2,
          outputThree: 3
        }

        createMappedObject(ctx, mappingSchema)

        t.deepEqual(ctx.body, expected)
        t.end()
      }
    )

    t.test(
      'should create an object based on mapping (from request body, lookup requests and constants) ',
      t => {
        const ctx = {
          request: {
            body: {
              inputZero: 0
            }
          },
          lookupRequests: {
            inputOne: 1,
            inputTwo: 2,
            inputThree: 3
          },
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            }
          }
        }

        const inputConstants = {
          inputFour: 4,
          inputFive: 5
        }

        const mappingSchema = {
          'requestBody.inputZero': 'outputZero',
          'lookupRequests.inputOne': 'outputOne',
          'lookupRequests.inputTwo': 'outputTwo',
          'lookupRequests.inputThree': 'outputThree',
          'constants.inputFour': 'outputFour'
        }

        const expected = {
          outputZero: 0,
          outputOne: 1,
          outputTwo: 2,
          outputThree: 3,
          outputFour: 4
        }

        createMappedObject(ctx, mappingSchema, inputConstants)

        t.deepEqual(ctx.body, expected)
        t.equals(ctx.status, 200)
        t.end()
      }
    )

    t.test('should map and create mapping orchestration', t => {
      const ctx = {
        request: {
          body: {
            inputZero: 0
          },
          header: {
            'x-openhim-transactionid': '1233'
          }
        },
        lookupRequests: {
          inputOne: 1
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }

      const inputConstants = {
        inputFour: 4,
        inputFive: 5
      }

      const mappingSchema = {
        'requestBody.inputZero': 'outputZero',
        'lookupRequests.inputOne': 'outputOne',
        'constants.inputFour': 'outputFour'
      }

      const expected = {
        outputZero: 0,
        outputOne: 1,
        outputFour: 4
      }

      createMappedObject(ctx, mappingSchema, inputConstants)

      t.equals(ctx.orchestrations.length, 1)
      t.equals(ctx.orchestrations[0].name, 'Mapping')
      t.deepEqual(ctx.orchestrations[0].response.body, JSON.stringify(expected))
      t.end()
    })
  })
})
