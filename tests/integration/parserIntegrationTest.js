const tape = require('tape')
const http = require('http')
const supertest = require('supertest')
const app = require('../../src/index')

tape.test('Parsing Integration Tests', t => {
  tape.onFinish(() => {
    server.close()
  })

  const server = http.createServer(app.callback())
  const request = supertest(server)

  t.test(
    'should fail to parse when body format and content-type do not match',
    t => {
      const payload = '{length: 8.0, width: 4.0}'

      request
        .post('/test')
        .send(payload)
        .expect(400)
        .set('Content-Type', 'application/xml')
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            t.fail(err)
          }

          console.log('Your body: ', res.text)

          t.equals(
            res.text.match(/Parsing incoming body failed: Bad Request/).length,
            1
          )
          t.end()
        })
    }
  )
})
