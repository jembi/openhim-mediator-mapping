'use strict'

const tap = require('tap')
const rewire = require('rewire')
const sinon = require('sinon')

const kafka = rewire('../../src/kafka')

tap.test('Kafka', {autoend: true}, t => {
  t.test('initiateKafkaClient', {autoend: true}, t => {
    t.test('should call subscribeTopicToConsumer', async t => {
      const endpoints = [{id: '1234'}]
      const spy = sinon.spy()

      const subscribeTopicToKafkaMockRevert = kafka.__set__(
        'subscribeTopicToConsumer',
        spy
      )
      await kafka.initiateKafkaClient(endpoints)
      t.ok(spy.called)
      t.same(endpoints, spy.args[0])

      subscribeTopicToKafkaMockRevert()
      t.end()
    })
  })

  t.test('sendToKafka', {autoend: true}, t => {
    t.test('should send to kafka', {autoend: true}, async t => {
      const spy = sinon.spy()
      const kafkaProducerMockRevert = kafka.__set__('kafkaProducer', {
        send: () => {
          spy.call()
        }
      })

      await kafka.sendToKafka('topic', {message: 'test'})
      t.ok(spy.called)

      kafkaProducerMockRevert()
      t.end()
    })
  })

  t.test('subcribeTopicToConsumer', {autoend: true}, t => {
    t.test('should subscribe topic to consumer', {autoend: true}, async t => {
      const endpoint = {
        kafkaConsumerTopic: 'test',
        endpoint: {
          pattern: '/test'
        },
        transformation: {
          input: 'JSON'
        }
      }
      const spy = sinon.spy()
      const kafkaConsumerMockRevert = kafka.__set__('kafkaConsumer', {
        subscribe: () => {
          spy.call()
        }
      })

      await kafka.subscribeTopicToConsumer(endpoint)
      t.ok(spy.called)

      kafkaConsumerMockRevert()
      t.end()
    })
  })

  t.test('unsubcribeTopicFromConsumer', {autoend: true}, t => {
    t.test(
      'should unsubscribe topic from consumer',
      {autoend: true},
      async t => {
        const spy = sinon.spy()
        const kafkaConsumerMockRevert = kafka.__set__('kafkaConsumer', {
          disconnect: () => {
            spy.call()
          }
        })

        await kafka.unsubscribeTopicFromConsumer('test', [])
        t.ok(spy.called)

        kafkaConsumerMockRevert()
        t.end()
      }
    )
  })
})
