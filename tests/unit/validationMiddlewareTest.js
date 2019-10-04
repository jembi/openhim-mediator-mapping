const tape = require('tape')
const { createJoiValidationSchema } = require('../../middleware/validation')

tape.test('createJoiValidationSchema()', t => {
  t.test('should return null when resource name is not supported', t => {
    const result = createJoiValidationSchema('unsupported')
    t.equal(result, null)
    t.end()
  })

  t.test('should return a schema object', t => {
    const result = createJoiValidationSchema('bahmniPatient')
    t.notEqual(result, null)
    t.end()
  })
})
