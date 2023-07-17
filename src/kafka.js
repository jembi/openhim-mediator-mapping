'use strict'

const {KafkaProducer, KafkaConsumer} = require('./kafkaUtils')
const {port} = require('./config').getConfig()
const logger = require('./logger')

let kafkaConsumer, kafkaProducer

const initiateKafkaClient = (endpoints = []) => {
  kafkaConsumer = new KafkaConsumer()
  kafkaProducer = new KafkaProducer()

  try {
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i]
      subscribeTopicToConsumer(endpoint)
    }
  } catch (error) {
    logger.error(error)
  }
}

const subscribeTopicToConsumer = async endpoint => {
  if (endpoint.kafkaConsumerTopic) {
    await kafkaConsumer.subscribe(endpoint.kafkaConsumerTopic, {
      url: `http://localhost:${port}${endpoint.endpoint.pattern}`,
      headers: {
        'Content-Type': `application/${endpoint.transformation.input.toLowerCase()}`
      }
    })
  }
}

// Library being used does not have a way to unsubscribe a topic. Workaround it to disconnect the consumer and create a new instance of the consumer
const unsubscribeTopicFromConsumer = async (topic, remainingEndpoints) => {
  logger.info(
    'Disconnecting consumer to allow for unsubscribing to take place!'
  )

  await kafkaConsumer.disconnect()
  await initiateKafkaClient(remainingEndpoints)

  logger.info(`Successfully unsubscribed topic "${topic}"`)
}

const sendToKafka = async (topic, message) => {
  logger.info(`Sending data to kafka topic "${topic}"`)
  return kafkaProducer.send(topic, message)
}

module.exports = {
  sendToKafka,
  subscribeTopicToConsumer,
  unsubscribeTopicFromConsumer,
  initiateKafkaClient
}
