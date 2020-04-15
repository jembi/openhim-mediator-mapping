'use strict'

const rewire = require('rewire')
const tap = require('tap')

const parser = rewire('../../src/middleware/parser')

const parseIncomingBody = parser.__get__('parseIncomingBody')
const parseOutgoingBody = parser.__get__('parseOutgoingBody')

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

        try {
          await parseIncomingBody(ctx, inputFormat)
        } catch (error) {
          t.equal(
            error.message,
            'Testing endpoint (randomUidForRequest): transformation method "unsupported" not yet supported'
          )
        }
      }
    )

    t.test(
      'should throw error when inputFormat for endpoint does not match the request body content type',
      async t => {
        t.plan(1)
        const ctx = {
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            }
          },
          get: name => {
            const contentHeader = 'application/unsupported'
            if (name) {
              return contentHeader
            }
          }
        }
        const inputFormat = 'JSON'

        try {
          await parseIncomingBody(ctx, inputFormat)
        } catch (error) {
          t.equal(
            error.message
              .match(
                /Supplied input format does not match incoming content-type:/
              )
              .includes(
                'Supplied input format does not match incoming content-type:'
              ),
            true
          )
        }
      }
    )

    t.test('should parse data and create an orchestration', async t => {
      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          }
        },
        get: name => {
          const contentHeader = 'application/xml'
          if (name) {
            return contentHeader
          }
        },
        request: {
          body: {
            name: 'Moin',
            surname: 'Sacks'
          },
          header: {
            'x-openhim-transactionid': '12333'
          },
          raw_body: '<xml><name>Moin</name><surname>Sacks</surname></xml>'
        }
      }
      const inputFormat = 'XML'

      await parseIncomingBody(ctx, inputFormat)
      console.log('the ocher: ', ctx.orchestrations[0].request.body)

      t.equals(ctx.orchestrations.length, 1)
      t.equals(ctx.orchestrations[0].name, 'Incoming Parser')
      t.equals(ctx.orchestrations[0].request.body, ctx.request.raw_body)
      t.equals(
        ctx.orchestrations[0].response.body,
        JSON.stringify(ctx.request.body)
      )
      t.end()
    })
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
        },
        request: {}
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

    t.test(
      'should parse body from json to xml format and create an orchestration',
      t => {
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
          },
          request: {
            header: {
              'x-openhim-transactionid': '12333'
            }
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
        t.equals(ctx.orchestrations.length, 1)
        t.equals(ctx.orchestrations[0].name, 'Outgoing Parser')
        t.end()
      }
    )
  })
})
