'use strict'

const tap = require('tap')
const db = require('../../src/db/main')
const mongoose = require('mongoose')
const sinon = require('sinon')

tap.test('Database interactions', {autoend: true}, t => {
  t.test('Connect to DB', {autoend: true}, t => {
    t.afterEach(async () => {
      await mongoose.disconnect()
      console.debug('Closed all connections to DB')
    })

    t.test('should fail to connect to db', {autoend: true}, async t => {
      t.plan(1)
      try {
        await db.open('Invalid URL')
      } catch (error) {
        t.equal(error.message, 'Invalid connection string')
      }
    })

    t.test('should connect to DB', {autoend: true}, async t => {
      try {
        await db.open('mongodb://localhost:27017/unitTest')
        t.pass('No issues connecting to DB!')
      } catch (error) {
        t.fail(`Should not have reached here: ${error.message}`)
      }
    })
  })

  t.test('Disconnect from DB', {autoend: true}, t => {
    let sandbox
    t.beforeEach(done => {
      sandbox = sinon.createSandbox()
      done()
    })

    t.afterEach(done => {
      sandbox.restore()
      done()
    })

    t.test('should fail DB disconnect', {autoend: true}, async t => {
      sandbox.stub(mongoose.connection, 'close').throws(function() {
        return new Error('Failed Disconnect')
      })
      try {
        await db.close()
        t.fail('Should not have reached here!')
      } catch (error) {
        t.equal(error.message, 'Failed Disconnect')
      }
    })

    t.test('should disconnect from DB', {autoend: true}, async t => {
      try {
        await db.close()
        t.pass('No issues disconnect from DB!')
      } catch (error) {
        t.fail(`Should not have reached here: ${error.message}`)
      }
    })
  })
})
