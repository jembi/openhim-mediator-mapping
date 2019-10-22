'use strict'

const tap = require('tap')
const {
  parseIncomingBody,
  parseOutgoingBody
} = require('../../src/middleware/parser')

tap.test('Parser', {autoend: true}, t => {
  t.test('parseIncomingBody', {autoend: true}, t => {
    t.test(
      'should throw error when transformation method is not supported',
      async t => {
        t.plan(1)
        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            }
          }
        }
        const inputFormat = 'unsupported'
        const next = () => {}
        try {
          await parseIncomingBody(ctx, inputFormat, next)
        } catch (error) {
          t.equal(
            error.message,
            'Testing endpoint (randomUidForRequest): transformation method "unsupported" not yet supported'
          )
        }
      }
    )
  })

  t.test('parseOutgoingBody', {autoend: true}, t => {
    t.test('should throw an error when parsing fails', t => {
      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        }
      }
      const outputFormat = 'XML'

      t.throws(
        () => parseOutgoingBody(ctx, outputFormat),
        /Parsing outgoing body failed/
      )
      t.end()
    })

    t.test('should parse body from json to xml format', t => {
      const ctx = {
        body: {
          Name: 'Jet',
          Surname: 'Li',
          Email: 'jet@openhim.org'
        },
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        },
        set: (key, value) => {
          ctx.header = {}
          ctx.header[key] = value
        }
      }
      const outputFormat = 'XML'
      const expectedHeader = {
        'Content-Type': 'application/xml'
      }

      const expectedBody =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<root>\n' +
        '  <Name>Jet</Name>\n' +
        '  <Surname>Li</Surname>\n' +
        '  <Email>jet@openhim.org</Email>\n</root>'

      parseOutgoingBody(ctx, outputFormat)

      t.deepEqual(ctx.body, expectedBody)
      t.deepEqual(ctx.header, expectedHeader)
      t.end()
    })
  })
})
