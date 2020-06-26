'use strict'

const tap = require('tap')

const {extractRegexFromPattern} = require('../../src/util')

tap.test('Utility Methods', {autoend: true}, t => {
  t.test('extractRegexFromPattern', {autoend: true}, t => {
    t.test(
      'should extract regex from pattern "/organization/:uid/unit/:name" and verify regex',
      t => {
        const pattern = '/organization/:uid/unit/:name/'
        const expectedRegex = new RegExp(
          `\\/organization\\/(?<uid>[^ ;:=#@,/]{1,})\\/unit\\/(?<name>[^ ;:=#@,/]{1,})\\/$`
        )
        const regex = extractRegexFromPattern(pattern)

        t.equal(regex, expectedRegex.source)

        // Verify regex
        const testString = '/organization/12222/unit/2/'
        const invalidTestString = '/organization/122:22/unit/2'
        const invalidTestString1 = '/organization/122/22/unit/2:'
        const invalidTestString2 = '/organization/12222/unit/2'

        t.ok(testString.match(regex))
        t.notOk(invalidTestString.match(regex))
        t.notOk(invalidTestString1.match(regex))
        t.notOk(invalidTestString2.match(regex))
        t.end()
      }
    )

    t.test('should extract regex from pattern "/organization"', t => {
      const pattern = '/organization/'
      const expectedRegexString = '\\/organization\\/$'
      const regex = extractRegexFromPattern(pattern)

      t.equal(regex, expectedRegexString)

      // verify regex
      const testString = '/organization/'
      const invalidTestString = '/organization/122:22/unit/2'
      const invalidTestString1 = '/organization'

      t.ok(testString.match(regex))
      t.notOk(invalidTestString.match(regex))
      t.notOk(invalidTestString1.match(regex))
      t.end()
    })
  })
})
