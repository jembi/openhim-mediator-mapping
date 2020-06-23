'use strict'

const rewire = require('rewire')
const tap = require('tap')
const {parseBodyMiddleware} = require('../../src/middleware/parser')

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
            },
            allData: {}
          },
          request: {
            query: {}
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
            },
            allData: {}
          },
          request: {
            query: {},
            method: 'POST'
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
          t.equals(
            error.message,
            `Supplied input format does not match incoming content-type: Expected json format, but received unsupported`
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
          },
          allData: {}
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
          raw_body: '<xml><name>Moin</name><surname>Sacks</surname></xml>' // ??? raw body us XML but body is JSON
        }
      }
      const inputFormat = 'XML'

      await parseIncomingBody(ctx, inputFormat)

      t.equals(ctx.orchestrations.length, 1)
      t.equals(ctx.orchestrations[0].name, 'Incoming Parser')
      t.equals(ctx.orchestrations[0].request.body, ctx.request.raw_body)
      t.equals(
        ctx.orchestrations[0].response.body,
        JSON.stringify(ctx.request.body)
      )
      t.end()
    })

    t.test(
      'should parse data and create an orchestration - with orchestrations array',
      async t => {
        const ctx = {
          orchestrations: [], // empty array to skip condition check
          state: {
            uuid: 'randomUidForRequest',
            metaData: {
              name: 'Testing endpoint'
            },
            allData: {}
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
            raw_body: '<xml><name>Moin</name><surname>Sacks</surname></xml>' // ??? raw body us XML but body is JSON
          }
        }
        const inputFormat = 'XML'

        await parseIncomingBody(ctx, inputFormat)

        t.equals(ctx.orchestrations.length, 1)
        t.equals(ctx.orchestrations[0].name, 'Incoming Parser')
        t.equals(ctx.orchestrations[0].request.body, ctx.request.raw_body)
        t.equals(
          ctx.orchestrations[0].response.body,
          JSON.stringify(ctx.request.body)
        )
        t.end()
      }
    )

    t.test('should parse data and create an orchestration - JSON', async t => {
      const ctx = {
        state: {
          uuid: 'randomUidForRequest',
          metaData: {
            name: 'Testing endpoint'
          },
          allData: {}
        },
        get: name => {
          const contentHeader = 'application/json'
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
          raw_body: '{"name": "Moin", "surname": "Sacks"}'
        }
      }
      const inputFormat = 'JSON'

      await parseIncomingBody(ctx, inputFormat)

      t.notOk(ctx.orchestrations) // should not exist
      t.end()
    })
  })

  t.test('should throw a parsing error', async t => {
    t.plan(1)
    const ctx = {
      state: {
        uuid: 'randomUidForRequest',
        metaData: {
          name: 'Testing endpoint'
        },
        allData: {}
      },
      request: null,
      get: name => {
        const contentHeader = 'application/xml'
        if (name) {
          return contentHeader
        }
      }
    }
    const inputFormat = 'XML'

    await parseIncomingBody(ctx, inputFormat)
      .then(() => t.fail('Should not reach here'))
      .catch(error => {
        t.equals(error.message, `Cannot read property 'query' of null`)
      })
    t.end()
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
        request: {},
        response: {
          type: ''
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
          },
          response: {
            type: ''
          }
        }
        const outputFormat = 'XML'
        const expectedHeader = {
          'Content-Type': 'application/xml'
        }

        parseOutgoingBody(ctx, outputFormat)

        t.equals(JSON.parse(ctx.body).status, 'Successful')
        t.deepEqual(ctx.header, expectedHeader)
        t.equals(ctx.orchestrations.length, 1)
        t.equals(ctx.orchestrations[0].name, 'Outgoing Parser')
        t.end()
      }
    )

    t.test(
      'should parse body from json to xml format and create an orchestration - with orchestrations array',
      t => {
        const ctx = {
          orchestrations: [], // empty array to skip condition check
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
          },
          response: {}
        }
        const outputFormat = 'XML'
        const expectedHeader = {
          'Content-Type': 'application/xml'
        }

        const expectedBody = [
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
          '<root>',
          '  <Name>Jet</Name>',
          '  <Surname>Li</Surname>',
          '  <Email>jet@openhim.org</Email>',
          '</root>'
        ].join('\n')

        parseOutgoingBody(ctx, outputFormat)

        t.deepEqual(ctx.header, expectedHeader)
        t.equals(ctx.orchestrations.length, 1)
        t.equals(ctx.orchestrations[0].name, 'Outgoing Parser')
        t.equals(ctx.orchestrations[0].response.body, expectedBody)
        t.end()
      }
    )
  })

  t.test('parseBodyMiddleware', {autoend: true}, t => {
    t.test(
      'should return an error for invalid input type and add error message to ctx',
      async t => {
        const ctx = {
          state: {
            uuid: 'unique-id',
            metaData: {
              name: 'Test endpoint',
              transformation: {
                input: 'XML',
                output: 'JSON'
              }
            }
          }
        }

        const next = () => {
          t.equals(ctx.status, 400)
          t.same(ctx.body, {
            error:
              'Test endpoint (unique-id): transformation method "INVALID" not yet supported'
          })
        }
        await parseBodyMiddleware()(ctx, next)
      }
    )

    t.test('should complete middleware request', async t => {
      t.plan(2)

      const ctx = {
        body: {
          Name: 'Jet',
          Surname: 'Li',
          Email: 'jet@openhim.org'
        },
        state: {
          uuid: 'randomUidForRequest',
          allData: {},
          metaData: {
            name: 'Testing endpoint',
            transformation: {
              input: 'JSON',
              output: 'XML'
            }
          },
          endpointExists: true
        },
        get: name => {
          const contentHeader = 'application/json'
          if (name) {
            return contentHeader
          }
        },
        set: (key, value) => {
          ctx.header = {}
          ctx.header[key] = value
        },
        request: {}
      }

      const next = () => {
        t.pass() // calls next
      }
      await parseBodyMiddleware()(ctx, next)

      t.equals(
        ctx.body,
        [
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
          '<root>',
          '  <Name>Jet</Name>',
          '  <Surname>Li</Surname>',
          '  <Email>jet@openhim.org</Email>',
          '</root>'
        ].join('\n')
      )
    })
  })
})
