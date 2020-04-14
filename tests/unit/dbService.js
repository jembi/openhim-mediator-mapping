'use strict'

const tap = require('tap')

const db = require('../../src/db')

const {
  createEndpoint,
  deleteEndpoint,
  deleteEndpoints,
  readEndpoints,
  updateEndpoint
} = require('../../src/db/services/endpoints')
const EndpointModel = require('../../src/db/models/endpoints')

db.open('mongodb://localhost:27017/unitTest')

tap.test('Database interactions', {autoend: true}, t => {
  t.test('CRUD interactions with DB', {autoend: true}, async t => {
    t.beforeEach(async () => {
      await EndpointModel.deleteMany({})
      console.debug('Deleted all resources in DB')
    })

    t.tearDown(async () => {
      await db.close()
      console.debug('Closed all connections to DB')
    })

    t.test(
      'should fail to create Endpoint when validation fails',
      {autoend: true},
      async t => {
        t.plan(1)
        const testEndpointConfig = {
          name: 'test',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'JSON',
            output: null
          }
        }
        await createEndpoint(testEndpointConfig)
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'endpoint validation failed: transformation.output: Path `transformation.output` is required.'
            )
          })
      }
    )

    t.test('should create Endpoint', {autoend: true}, async t => {
      t.plan(2)
      const testEndpointConfig = {
        name: 'test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }
      await createEndpoint(testEndpointConfig)
        .then(data => {
          t.ok(data.id)
          t.equals(data.name, 'test')
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })
    })

    t.test(
      'should fail to create Endpoint if an Endpoint with that name already exists',
      {autoend: true},
      async t => {
        t.plan(3)
        const testEndpointConfig = {
          name: 'test',
          endpoint: {
            pattern: '/test1'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          lastUpdated: Date.now()
        }

        await createEndpoint(testEndpointConfig)
          .then(data => {
            t.ok(data.id)
            t.equals(data.name, 'test')
          })
          .catch(error => {
            t.fail(`Should not reach here. ${error.message}`)
          })

        const sameNameTestEndpointConfig = {
          name: 'test',
          endpoint: {
            pattern: '/test2'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          lastUpdated: Date.now()
        }

        await createEndpoint(sameNameTestEndpointConfig)
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'E11000 duplicate key error collection: unitTest.endpoints index: name_1 dup key: { name: "test" }'
            )
          })
      }
    )

    t.test(
      'should fail to create Endpoint if an Endpoint with that pattern already exists',
      {autoend: true},
      async t => {
        t.plan(3)
        const testEndpointConfig = {
          name: 'test 1',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          lastUpdated: Date.now()
        }

        await createEndpoint(testEndpointConfig)
          .then(data => {
            t.ok(data.id)
            t.equals(data.name, 'test 1')
          })
          .catch(error => {
            t.fail(`Should not reach here. ${error.message}`)
          })

        const samePatternTestEndpointConfig = {
          name: 'test 2',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          lastUpdated: Date.now()
        }

        await createEndpoint(samePatternTestEndpointConfig)
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'E11000 duplicate key error collection: unitTest.endpoints index: endpoint.pattern_1 dup key: { endpoint.pattern: "/test" }'
            )
          })
      }
    )

    t.test('should read Endpoints', {autoend: true}, async t => {
      t.plan(3)

      await readEndpoints({})
        .then(data => {
          t.equals(data.length, 0)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      const testEndpointConfig = {
        name: 'test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }

      await createEndpoint(testEndpointConfig)
        .then(data => {
          t.ok(data.id)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      await readEndpoints({})
        .then(data => {
          t.equals(data.length, 1)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })
    })

    t.test(
      'should fail to read Endpoints when queryParams are invalid',
      {autoend: true},
      async t => {
        t.plan(1)

        await readEndpoints('Invalid')
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'Parameter "filter" to find() must be an object, got Invalid'
            )
          })
      }
    )

    t.test('should update Endpoint', {autoend: true}, async t => {
      t.plan(3)
      const testEndpointConfig = {
        name: 'test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }

      let endpointId

      await createEndpoint(testEndpointConfig)
        .then(data => {
          endpointId = data.id
          t.ok(data.id)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      const updatedTestEndpointConfig = {
        name: 'updated test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }
      await updateEndpoint(endpointId, updatedTestEndpointConfig)
        .then(data => {
          t.equals(data.id, endpointId)
          t.equals(data.name, 'updated test')
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })
    })

    t.test(
      'should fail to update Endpoint when validation fails',
      {autoend: true},
      async t => {
        t.plan(2)
        const testEndpointConfig = {
          name: 'test',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'JSON',
            output: 'JSON'
          },
          lastUpdated: Date.now()
        }

        let endpointId

        await createEndpoint(testEndpointConfig)
          .then(data => {
            endpointId = data.id
            t.ok(data.id)
          })
          .catch(error => {
            t.fail(`Should not reach here. ${error.message}`)
          })

        const updatedTestEndpointConfig = {
          name: 'updated test',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'JSON',
            output: 'Invalid'
          },
          lastUpdated: Date.now()
        }
        await updateEndpoint(endpointId, updatedTestEndpointConfig)
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'Validation failed: transformation.output: `Invalid` is not a valid enum value for path `transformation.output`.'
            )
          })
      }
    )

    t.test('should delete Endpoint', {autoend: true}, async t => {
      t.plan(3)
      const testEndpointConfig = {
        name: 'test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }

      let endpointId

      await createEndpoint(testEndpointConfig)
        .then(data => {
          t.ok(data.id)
          endpointId = data.id
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      await deleteEndpoint(endpointId)
        .then(data => {
          t.equals(data.n, 1)
          t.equals(data.deletedCount, 1)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })
    })

    t.test(
      'should delete Endpoint even if ObjectId does not exist',
      {autoend: true},
      async t => {
        // Random valid ObjectId that does not exist in DB
        await deleteEndpoint('5e8d99cdbd40b81685123231')
          .then(data => {
            // The numbers here should be zero as the document did not exist
            t.equals(data.n, 0)
            t.equals(data.deletedCount, 0)
          })
          .catch(error => {
            t.fail(`Should not reach here. ${error.message}`)
          })
      }
    )

    t.test(
      'should fail to delete Endpoint when ObjectId is invalid',
      {autoend: true},
      async t => {
        t.plan(1)

        await deleteEndpoint('Not Valid')
          .then(data => {
            t.fail(`Should not reach here. ${data}`)
          })
          .catch(error => {
            t.equals(
              error.message,
              'Cast to ObjectId failed for value "Not Valid" at path "_id" for model "endpoint"'
            )
          })
      }
    )

    t.test('should delete Endpoints', {autoend: true}, async t => {
      t.plan(4)
      const testEndpointConfig1 = {
        name: 'test1',
        endpoint: {
          pattern: '/test1'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }

      const testEndpointConfig2 = {
        name: 'test2',
        endpoint: {
          pattern: '/test2'
        },
        transformation: {
          input: 'JSON',
          output: 'JSON'
        },
        lastUpdated: Date.now()
      }

      await createEndpoint(testEndpointConfig1)
        .then(data => {
          t.ok(data.id)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      await createEndpoint(testEndpointConfig2)
        .then(data => {
          t.ok(data.id)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })

      await deleteEndpoints({})
        .then(data => {
          t.equals(data.n, 2)
          t.equals(data.deletedCount, 2)
        })
        .catch(error => {
          t.fail(`Should not reach here. ${error.message}`)
        })
    })
  })
})
