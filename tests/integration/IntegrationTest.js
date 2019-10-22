'use strict'

const tap = require('tap')
const http = require('http')
const supertest = require('supertest')

const {createTestEndpoint, removeTestEndpoint} = require('../testUtils')

let app, server, request

tap.test('Parsing Integration Tests', { autoend: true }, t => {
  tap.tearDown(() => {
    server.close()

    // Remove the test endpoint folder
    removeTestEndpoint()
  })

  t.test('Setup endpoints', t => {
    // Create an endpoint for the tests
    createTestEndpoint()

    app = require('../../src/index')
    server = http.createServer(app.callback())
    request = supertest(server)
    t.end()
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
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          t.equals(
            res.text,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<error>Parsing incoming body failed: Bad Request</error>'
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
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          t.equals(
            res.text,
            '{"error":"Validation failed: data should have required property \'name\'"}'
          )
          t.end()
        })
    }
  )

  t.test('should successfully map xml object to json', t => {
    const payload = `<xml>
        <name>Jet</name>
        <surname>Li</surname>
        <email>jet@openhim.org</email>
        <middleName>Wang</middleName>
        <gender>Male</gender>
        <attributes>Polite</attributes>
        <attributes>Courageous</attributes>
        </xml>`

    const expectedResponseBody = {
      resourceType: 'Dj',
      firstName: 'Jet',
      lastName: 'Li',
      character: ['Polite', 'Courageous']
    }

    request
      .post('/integrationTest')
      .send(payload)
      .expect(200)
      .set('Content-Type', 'application/xml')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          t.fail(err)
        }

        t.deepEqual(res.body, expectedResponseBody)
        t.end()
      })
  })
})
