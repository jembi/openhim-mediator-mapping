'use strict'

const tap = require('tap')

tap.test('Parsing Integration Tests', {autoend: true}, t => {
  t.test(
    'should fail to map when parsing fails (body format and content-type mismatch)',
    {autoend: true},
    t => {
      t.plan(1)
      t.ok('TODO')
    }
  )
  t.test(
    'should fail to map when validation fails (required property missing)',
    t => {
      t.plan(1)
      t.ok('TODO')
    }
  )

  t.test(
    'should successfully map xml object to json and send external requests',
    t => {
      t.plan(1)
      t.ok('TODO')
    }
  )
})
