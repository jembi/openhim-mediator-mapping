'use strict'

const {KafkaProducer, KafkaConsumer} = require('./kafkaUtils')
const {port} = require('./config').getConfig()
const logger = require('./logger')

let kafkaConsumer, kafkaProducer

const initiateKafkaClient = async (endpoints = []) => {
  kafkaConsumer = new KafkaConsumer()
  kafkaProducer = new KafkaProducer()

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i]

    await subscribeTopicToConsumer(endpoint)
  }
}

const subscribeTopicToConsumer = async endpoint => {
  if (endpoint.kafkaConsumerTopic) {
    await kafkaConsumer.subscribe(endpoint.kafkaConsumerTopic, {
      url: `http://localhost:${port}/${endpoint.endpoint.pattern}`,
      headers: {
        'Content-Type': `application/${endpoint.transformation.input.toLowerCase()}`
      }
    })
  }
}

const unsubscribeTopicFromConsumer = async endpoint => {
  if (endpoint.kafkaConsumerTopic) {
    await kafkaConsumer.unsubscribe(endpoint.kafkaConsumerTopic)
  }
}

const sendToKafka = async (topic, message) => {
  logger.info(`Sending data to kafka topic - ${topic}`)
  return kafkaProducer.send(topic, message)
}

module.exports = {
  sendToKafka,
  subscribeTopicToConsumer,
  unsubscribeTopicFromConsumer,
  initiateKafkaClient
}
