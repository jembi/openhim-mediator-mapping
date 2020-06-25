'use strict'

const tap = require('tap')

const {
  extractRegexFromPattern,
  extractUrlParamsFromUrlPath
} = require('../../src/util')

tap.test('Utility Methods', {autoend: true}, t => {
  t.test('extractRegexFromPattern', {autoend: true}, t => {
    t.test(
      'should extract regex from pattern "/organization/:uid/unit/:name" and verify regex',
      t => {
        const pattern = '/organization/:uid/unit/:name/'
        const expectedRegex = `\\/organization\\/(?<uid>[^ ;:=#@,\\/]{1,})\\/unit\\/(?<name>[^ ;:=#@,\\/]{1,})\\/$`
        const regex = extractRegexFromPattern(pattern)

        t.equal(regex, expectedRegex)

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

  t.test('extractUrlParamsFromUrlPath', {autoend: true}, t => {
    t.test('should return empty object when url path is invalid', t => {
      const path = ''
      const pattern = '/os/om'

      t.deepEqual(extractUrlParamsFromUrlPath(path, pattern), {})
      t.end()
    })

    t.test('should return empty object when pattern is invalid', t => {
      const path = '/os/om'
      const pattern = ''

      t.deepEqual(extractUrlParamsFromUrlPath(path, pattern), {})
      t.end()
    })

    t.test(
      'should return empty object when pattern and path are not in the same format',
      t => {
        const pattern = '/patient/:name'
        const path = '/patient/tarzan/jungle'

        t.deepEqual(extractUrlParamsFromUrlPath(path, pattern), {})
        t.end()
      }
    )

    t.test('should return url params', t => {
      const pattern = '/patient/:name/:surname'
      const path = '/patient/tarzan/jungle'
      const expectedUrlParams = {
        name: 'tarzan',
        surname: 'jungle'
      }

      t.deepEqual(extractUrlParamsFromUrlPath(path, pattern), expectedUrlParams)
      t.end()
    })
  })
})
