'use strict'

const tape = require('tape')
const http = require('http')
const supertest = require('supertest')
const {createTestEndpoint, removeTestEndpoint} = require('../testUtils')

// Create an endpoint for the tests
createTestEndpoint()

const app = require('../../src/index')

// Remove the test endpoint folder
removeTestEndpoint()

tape.test('Parsing Integration Tests', t => {
  tape.onFinish(() => {
    server.close()
  })

  const server = http.createServer(app.callback())
  const request = supertest(server)

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
            res.text.match(/Parsing incoming body failed: Bad Request/).length,
            1
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

          t.equals(res.text.match(/Validation failed:/).length, 1)
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
