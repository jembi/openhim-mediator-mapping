'use strict'

const tap = require('tap')
const rewire = require('rewire')
const sinon = require('sinon')
const nock = require('nock')

const kafka = rewire('../../src/kafkaUtils')

tap.test('KafkaUtils', {autoend: true}, t => {
  t.test('kafkaConsumer', {autoend: true}, t => {
    t.test('should create a kafka consumer instance', async t => {
      const consumer = new kafka.KafkaConsumer()

      t.notOk(consumer.isConnected)

      const spy = sinon.spy()
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      const spy3 = sinon.spy()
      const spy4 = sinon.spy()

      consumer.consumer = {
        disconnect: () => {
          spy.call()
        },
        connect: () => {
          spy1.call()
        },
        subscribe: () => {
          spy2.call()
        },
        run: () => {
          spy3.call()
        },
        stop: () => {
          spy4.call()
        }
      }

      consumer.disconnect()
      t.ok(spy.called)

      const topic = 'test'
      const topicRequestDetails = {
        url: 'http://localhost:1233/test',
        headers: {'Content-Type': 'application/json'}
      }
      await consumer.subscribe(topic, topicRequestDetails)

      t.ok(spy1.called)
      t.ok(spy2.called)
      t.ok(spy3.called)
      t.ok(consumer.isConnected)

      // Fails when topic has already been subscribed
      try {
        await consumer.subscribe(topic, topicRequestDetails)
      } catch (error) {
        t.equal(
          error.message,
          'Kafka topic "test" already attached to another endpoint'
        )
      }

      // should subscribe another topic to consumer
      await consumer.subscribe('test1', {
        url: 'localhost',
        headers: {'Content-Type': 'application/json'}
      })
      t.ok(spy4.called)

      const scope = nock('http://localhost:1233').post('/test').reply(200)
      // Process message
      consumer.processKafkaMessage('test', 0, {value: 'test message'})
      scope.done()
      t.end()
    })
  })

  t.test('KafkaProducer', {autoend: true}, t => {
    t.test('should create kafka producer instance', async t => {
      const producer = new kafka.KafkaProducer()

      t.notOk(producer.isConnected)

      const spy = sinon.spy()
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()

      producer.producer = {
        disconnect: () => {
          spy.call()
        },
        send: () => {
          spy1.call()
        },
        connect: () => {
          spy2.call()
        }
      }

      await producer.disconnect()
      t.ok(spy.called)

      await producer.send('test', {message: 'test'})
      t.ok(spy1.called)
      t.ok(spy2.called)
      t.ok(producer.isConnected)
      t.end()
    })
  })

  t.test('toWinstonLogger', {autoend: true}, t => {
    t.test('should return the corrent log level', t => {
      const toWinstonLogLevel = kafka.__get__('toWinstonLogLevel')
      t.equal(toWinstonLogLevel(0), 'error')
      t.equal(toWinstonLogLevel(1), 'error')
      t.equal(toWinstonLogLevel(2), 'warn')
      t.equal(toWinstonLogLevel(4), 'info')
      t.equal(toWinstonLogLevel(5), 'debug')
      t.end()
    })
  })

  t.test('kafkaLogger', {autoend: true}, t => {
    t.test('should return function', t => {
      const kafkaLogger = kafka.__get__('kafkaLogger')

      t.ok(typeof kafkaLogger() === 'function')
      t.end()
    })
  })
})
