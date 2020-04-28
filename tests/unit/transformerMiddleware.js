'use strict'

const tap = require('tap')
const rewire = require('rewire')

const {transformerMiddleware} = require('../../src/middleware/transformer')

const transformer = rewire('../../src/middleware/transformer')
const jsonataTransformer = transformer.__get__('jsonataTransformer')

tap.test('Transformer Middleware', {autoend: true}, t => {
  t.test('jsonataTransformer', {autoend: true}, t => {
    t.test(
      'should return without adding any transforms if no inputTransforms supplied',
      async t => {
        t.plan(1)

        const ctx = {
          state: {
            metaData: {},
            allData: {}
          }
        }

        await jsonataTransformer(ctx)

        t.notOk(ctx.state.allData.transforms)
      }
    )

    t.test(
      'should return without adding any transforms if empty inputTransforms supplied',
      async t => {
        t.plan(1)

        const ctx = {
          state: {
            metaData: {
              inputTransforms: {}
            },
            allData: {}
          }
        }

        await jsonataTransformer(ctx)

        t.notOk(ctx.state.allData.transforms)
      }
    )

    t.test(
      'should return without adding any transforms if empty inputTransforms supplied',
      async t => {
        t.plan(1)

        const ctx = {
          state: {
            uuid: 'random-uuid',
            metaData: {
              name: 'Test endpoint',
              inputTransforms: {
                totalAmount: '$sum(requestBody.items.(amount * units))', // 1100
                bmi:
                  '$round(requestBody.patient.(weight / height / height) * 10000, 2)', // 25.54
                patientReference: "'Patient/' & requestBody.patient.uuid" // Patient/a-random-uuid
              }
            },
            allData: {
              requestBody: {
                patient: {
                  uuid: 'a-random-uuid',
                  height: 177,
                  weight: 80
                },
                items: [
                  {
                    amount: 150,
                    units: 3
                  },
                  {
                    amount: 100,
                    units: 5
                  },
                  {
                    amount: 75,
                    units: 2
                  }
                ]
              }
            }
          }
        }

        await jsonataTransformer(ctx)

        t.deepEquals(ctx.state.allData.transforms, {
          totalAmount: 1100,
          bmi: 25.54,
          patientReference: 'Patient/a-random-uuid'
        })
      }
    )
  })

  t.test('transformerMiddleware', {autoend: true}, t => {
    t.test(
      'should throw an error for an incorrectly formatted transform expressions',
      async t => {
        t.plan(2)

        const ctx = {
          state: {
            uuid: 'random-uuid',
            metaData: {
              name: 'Test endpoint',
              inputTransforms: {
                totalAmount: '$sum(requestBody.items.(amount * units', // should throw an error - missing end brackets
                bmi:
                  '$round(requestBody.patient.(weight / height / height) * 10000, 2)', // 25.54
                patientReference: "'Patient/' & requestBody.patient.uuid" // Patient/a-random-uuid
              }
            },
            allData: {
              requestBody: {
                patient: {
                  uuid: 'a-random-uuid',
                  height: 177,
                  weight: 80
                },
                items: [
                  {
                    amount: 150,
                    units: 3
                  },
                  {
                    amount: 100,
                    units: 5
                  },
                  {
                    amount: 75,
                    units: 2
                  }
                ]
              }
            }
          }
        }

        try {
          await transformerMiddleware()(ctx)
        } catch (err) {
          t.equal(ctx.status, 500)
          t.equal(
            err.message,
            'Input transform error: Expected ")" before end of expression'
          )
        }
      }
    )

    t.test('should complete transforms', async t => {
      t.plan(1)

      const ctx = {
        state: {
          uuid: 'random-uuid',
          metaData: {
            name: 'Test endpoint',
            inputTransforms: {
              totalAmount: '$sum(requestBody.items.(amount * units))', // should throw an error - missing end brackets
              bmi:
                '$round(requestBody.patient.(weight / height / height) * 10000, 2)', // 25.54
              patientReference: "'Patient/' & requestBody.patient.uuid" // Patient/a-random-uuid
            }
          },
          allData: {
            requestBody: {
              patient: {
                uuid: 'a-random-uuid',
                height: 177,
                weight: 80
              },
              items: [
                {
                  amount: 150,
                  units: 3
                },
                {
                  amount: 100,
                  units: 5
                },
                {
                  amount: 75,
                  units: 2
                }
              ]
            }
          }
        }
      }

      const next = () => {
        t.deepEquals(ctx.state.allData.transforms, {
          totalAmount: 1100,
          bmi: 25.54,
          patientReference: 'Patient/a-random-uuid'
        })
      }

      try {
        await transformerMiddleware()(ctx, next)
      } catch (err) {
        t.fail()
      }
    })
  })
})
