'use strict'

const request = require('supertest')
const tap = require('tap')

const port = 13008
process.env.MONGO_URL = 'mongodb://localhost:27017/endpointRoutesTest'

const {withTestMapperServer} = require('../utils')

tap.test(
  'Endpoint Routes',
  withTestMapperServer(port, async t => {
    t.test('create endpoint route', {autoend: true}, t => {
      t.test('should return 400 when the request body is invalid', async t => {
        const testEndpoint = {}

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(400)

        t.end()
      })

      t.test('should create endpoint', async t => {
        const testEndpoint = {
          name: 'Test Endpoint',
          endpoint: {
            pattern: '/test'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        const result = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        t.equal(result.body.name, testEndpoint.name)
        t.equal(result.body.pattern, testEndpoint.pattern)
        t.end()
      })

      t.test(
        'should fail to create when endpoint "patternRegex" already exists',
        async t => {
          const testEndpoint = {
            name: 'Test Endpoint 0',
            endpoint: {
              pattern: '/test/name/:id/section/:code',
              method: 'POST'
            },
            transformation: {
              input: 'XML',
              output: 'XML'
            }
          }

          const duplicateEndpoint = {
            name: 'Test Endpoint duplicate',
            endpoint: {
              pattern: '/test/name/:surname/section/:code'
            },
            transformation: {
              input: 'XML',
              output: 'XML'
            }
          }

          // Add endpoint
          await request(`http://localhost:${port}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(201)

          const result = await request(`http://localhost:${port}`)
            .post('/endpoints')
            .send(duplicateEndpoint)
            .set('Content-Type', 'application/json')
            .expect(400)

          t.ok(
            result.body.error.match(
              /Duplicate error: regex created from endpoint pattern /
            )
          )
          t.end()
        }
      )

      t.test(
        'should fail to create when endpoint pattern is missing parameter name (internal path)',
        async t => {
          const testEndpoint = {
            name: 'Test Endpoint 00',
            endpoint: {
              pattern: '/test/name/:/section/:coode',
              method: 'POST'
            },
            transformation: {
              input: 'XML',
              output: 'XML'
            }
          }

          const result = await request(`http://localhost:${port}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(400)

          t.ok(
            result.body.error.match(
              'Invalid url parameters specified in pattern, url parameter specification format is "/:<PARAMETER_NAME>"'
            )
          )

          t.end()
        }
      )

      t.test(
        'should fail to create when endpoint pattern is missing parameter name (end of path)',
        async t => {
          const testEndpoint = {
            name: 'Test Endpoint 01',
            endpoint: {
              pattern: '/test/name/section/:',
              method: 'POST'
            },
            transformation: {
              input: 'XML',
              output: 'XML'
            }
          }

          const result = await request(`http://localhost:${port}`)
            .post('/endpoints')
            .send(testEndpoint)
            .set('Content-Type', 'application/json')
            .expect(400)

          t.ok(
            result.body.error.match(
              'Invalid url parameters specified in pattern, url parameter specification format is "/:<PARAMETER_NAME>"'
            )
          )

          t.end()
        }
      )
    })

    t.test('read endpoint route', {autoend: true}, t => {
      t.test(
        'should return a 400 response when endpoint id is invalid',
        async t => {
          const endpointId = '123'

          const result = await request(`http://localhost:${port}`)
            .get(`/endpoints/${endpointId}`)
            .expect(400)

          t.equal(
            result.body.error,
            'Retrieving of endpoint failed: Endpoint ID supplied in url is invalid'
          )
          t.end()
        }
      )

      t.test(
        'should return a 404 response when endpoint does not exist',
        async t => {
          const endpointId = '5db1e8e9d074237a356b36d1'

          const result = await request(`http://localhost:${port}`)
            .get(`/endpoints/${endpointId}`)
            .expect(404)

          t.equal(
            result.body.error,
            `Endpoint with ID ${endpointId} does not exist`
          )
          t.end()
        }
      )

      t.test('should create endpoint', async t => {
        const testEndpoint = {
          name: 'Test Endpoint 1',
          endpoint: {
            pattern: '/testSuccess1'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        const endpoint = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        const result = await request(`http://localhost:${port}`)
          .get(`/endpoints/${endpoint.body._id}`)
          .expect(200)

        t.equal(result.body.name, testEndpoint.name)
        t.equal(result.body.pattern, testEndpoint.pattern)
        t.end()
      })
    })

    t.test('read all endpoints route', {autoend: true}, t => {
      t.test('should get endpoints', async t => {
        const testEndpoint = {
          name: 'Test Endpoint 2',
          endpoint: {
            pattern: '/testSuccess2'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        const testEndpoint2 = {
          name: 'Test Endpoint 3',
          endpoint: {
            pattern: '/testSuccess3'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint2)
          .set('Content-Type', 'application/json')
          .expect(201)

        const result = await request(`http://localhost:${port}`)
          .get(`/endpoints`)
          .expect(200)

        t.ok(result.body.length)
        t.end()
      })

      t.test('should get endpoints based on query', async t => {
        const testEndpoint = {
          name: 'Test Endpoint 4',
          endpoint: {
            pattern: '/testSuccess4'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        const testEndpoint2 = {
          name: 'Test Endpoint 5',
          endpoint: {
            pattern: '/testSuccess5'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint2)
          .set('Content-Type', 'application/json')
          .expect(201)

        const endpoint = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        const result = await request(`http://localhost:${port}`)
          .get(`/endpoints?_id=${endpoint.body._id}`)
          .expect(200)

        t.equal(result.body.length, 1)
        t.equal(result.body[0].name, testEndpoint.name)
        t.equal(result.body[0].pattern, testEndpoint.pattern)
        t.end()
      })
    })

    t.test('update endpoint route', {autoend: true}, t => {
      t.test(
        'should return a 400 response status when endpoint id is invalid',
        async t => {
          const update = {}
          const endpointId = 'invalid'

          await request(`http://localhost:${port}`)
            .put(`/endpoints/${endpointId}`)
            .send(update)
            .set('Content-Type', 'application/json')
            .expect(400)

          t.end()
        }
      )

      t.test(
        'should return a 400 response status when update object is empty',
        async t => {
          const update = {}
          const endpointId = 'invalid'

          await request(`http://localhost:${port}`)
            .put(`/endpoints/${endpointId}`)
            .send(update)
            .set('Content-Type', 'application/json')
            .expect(400)

          t.end()
        }
      )

      t.test(
        'should return a 404 response status when endpoint does not exist',
        async t => {
          const update = {
            name: 'New name'
          }
          const endpointId = '5db1e8e9d074237a356b36d1'

          const result = await request(`http://localhost:${port}`)
            .put(`/endpoints/${endpointId}`)
            .send(update)
            .set('Content-Type', 'application/json')
            .expect(404)

          t.equal(
            result.body.error,
            `Endpoint with ID ${endpointId} does not exist`
          )
          t.end()
        }
      )

      t.test('should update the endpoint', async t => {
        const testEndpoint = {
          name: 'Test Endpoint 6',
          endpoint: {
            pattern: '/testSuccess6'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }
        const update = {
          transformation: {
            input: 'JSON',
            output: 'JSON'
          }
        }

        const endpoint = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        const result = await request(`http://localhost:${port}`)
          .put(`/endpoints/${endpoint.body._id}`)
          .send(update)
          .set('Content-Type', 'application/json')
          .expect(200)

        t.same(result.body.transformation, update.transformation)
        t.end()
      })
    })

    t.test('delete endpoint', {autoend: true}, t => {
      t.test(
        'should return a 400 response status when endpoint id is invalid',
        async t => {
          const endpointId = 'invalid'

          await request(`http://localhost:${port}`)
            .delete(`/endpoints/${endpointId}`)
            .expect(400)

          t.end()
        }
      )

      t.test(
        'should return a 404 response status when endpoint does not exist',
        async t => {
          const endpointId = '5db1e8e9d074237a356b36d1'

          const result = await request(`http://localhost:${port}`)
            .delete(`/endpoints/${endpointId}`)
            .expect(404)

          t.equal(
            result.body.error,
            `Endpoint with ID '${endpointId}' does not exist`
          )
          t.end()
        }
      )

      t.test('should delete the endpoint', async t => {
        const testEndpoint = {
          name: 'Test Endpoint 7',
          endpoint: {
            pattern: '/testSuccess7'
          },
          transformation: {
            input: 'XML',
            output: 'XML'
          }
        }

        const endpoint = await request(`http://localhost:${port}`)
          .post('/endpoints')
          .send(testEndpoint)
          .set('Content-Type', 'application/json')
          .expect(201)

        const result = await request(`http://localhost:${port}`)
          .delete(`/endpoints/${endpoint.body._id}`)
          .expect(200)

        t.same(
          result.body.message,
          `Endpoint with ID '${endpoint.body._id}' deleted`
        )
        t.end()
      })
    })
  })
)
