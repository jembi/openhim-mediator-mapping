'use strict'

const tap = require('tap')
const {createMappedObject} = require('../../src/middleware/mapper')

tap.test('Mapper', { autoend: true }, t => {
  t.test('createMappedObject()', { autoend: true }, t => {
    t.test('should throw when mapping schema is not supplied', t => {
      t.throws(createMappedObject, new Error(`No mapping schema supplied`))
      t.end()
    })

    t.test('should create an object based on mapping', t => {
      const ctx = {
        request: {
          body: {
            inputOne: 1,
            inputTwo: 2,
            inputThree: 3
          }
        }
      }

      const mappingSchema = {
        input: {
          inputOne: 'outputOne',
          inputTwo: 'outputTwo',
          inputThree: 'outputThree'
        },
        constants: {}
      }

      const expected = {
        outputOne: 1,
        outputTwo: 2,
        outputThree: 3
      }

      createMappedObject(ctx, mappingSchema)

      t.deepEqual(ctx.body, expected)
      t.end()
    })
  })
})
