'use strict'

const http = require('http')
const supertest = require('supertest')
const tap = require('tap')

const {
  closeExternalTestServer,
  createTestEndpoint,
  removeTestEndpoint,
  startExternalTestServer
} = require('../testUtils')

let app, server, request

tap.test('Parsing Integration Tests', {autoend: true}, t => {
  t.test('Setup endpoints', t => {
    // Create an endpoint for the tests
    createTestEndpoint()
      .then(() => {
        app = require('../../src/index')
        server = http.createServer(app.callback())
        request = supertest(server)
        t.end()
      })
      .catch(error => {
        console.error(`Failed to create Test Endpoint ${error.message}`)
      })
    startExternalTestServer()
  })

  tap.tearDown(() => {
    // Remove the test endpoint from MongoDB
    removeTestEndpoint()
      .then(() => {
        closeExternalTestServer()
      })
      .catch(error => {
        console.error(`Failed to delete Test Endpoints. Caused by: ${error}`)
      })
  })

  t.test(
    'should fail to map when parsing fails (body format and content-type mismatch)',
    t => {
      const payload = '{length: 8.0, width: 4.0}'
      request
        .post('/integrationTest')
        .send(payload)
        .expect(400)
        .set('Content-Type', 'application/xml')
        .set('x-openhim-transactionid', 'openhim-unique-tx-id')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          t.equals(
            res.text,
            '{"error":"IntegrationTest (openhim-unique-tx-id): Parsing incoming body failed: Bad Request"}'
          )
          t.end()
        })
    }
  )

  t.test(
    'should fail to map when validation fails (required property missing)',
    t => {
      const payload = `<xml>
        <surname>Li</surname>
        <email>jet@openhim.org</email>
        </xml>`

      request
        .post('/integrationTest')
        .send(payload)
        .expect(400)
        .set('Content-Type', 'application/xml')
        .set('x-openhim-transactionid', 'openhim-unique-tx-id')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          t.equals(
            res.text,
            '{"error":"IntegrationTest (openhim-unique-tx-id): Validation failed: data/requestBody should have required property \'name\', data/lookupRequests/lookup should be object"}'
          )
          t.end()
        })
    }
  )

  t.test(
    'should successfully map xml object to json and send external requests',
    t => {
      const id = '1233'
      const place = '1 bas bas'
      const code = '23424422'
      const payload = `<xml>
        <name>Jet</name>
        <surname>Li</surname>
        <email>jet@openhim.org</email>
        <middleName>Wang</middleName>
        <gender>Male</gender>
        <attributes>Polite</attributes>
        <attributes>Courageous</attributes>
        <id>${id}</id>
        <place><address>${place}</address></place>
        </xml>`

      request
        .post(`/integrationTest?code=${code}`)
        .send(payload)
        .expect(200)
        .set('Content-Type', 'application/xml')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          // The external server responds with a body that consists the query parameters sent in the request
          t.deepEqual(res.body, {place, code: `code:${code}:code`})
          t.end()
        })
    }
  )
})
