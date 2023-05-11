'use strict'

const {Kafka, logLevel} = require('kafkajs')
const axios = require('axios')

const {kafkaConfig} = require('./config').getConfig()
const logger = require('./logger')

// Customize Kafka logs
function kafkaLogger() {
  const toWinstonLogLevel = level => {
    switch (level) {
      case logLevel.ERROR:
      case logLevel.NOTHING:
        return 'error'
      case logLevel.WARN:
        return 'warn'
      case logLevel.INFO:
        return 'info'
      case logLevel.DEBUG:
        return 'debug'
    }
  }
  return ({level, log}) => {
    const {message, extra} = log
    logger[toWinstonLogLevel(level)]({
      message,
      extra
    })
  }
}

class KafkaClient {
  constructor() {
    const client = new Kafka({
      brokers: kafkaConfig.brokers.split(','),
      clientId: kafkaConfig.clientId,
      requestTimeout: kafkaConfig.requestTimeout,
      connectionTimeout: kafkaConfig.connectionTimeout,
      logLevel: logLevel.DEBUG,
      logCreator: kafkaLogger
    })
    this.producer = client.producer()
    this.consumer = client.consumer({
      groupId: kafkaConfig.groupId,
      allowAutoTopicCreation: true
    })
  }
}

class KafkaProducer extends KafkaClient {
  constructor() {
    super()
    this.isConnected = false
    this.producer.on(this.producer.events.DISCONNECT, () => {
      this.isConnected = false
    })
  }

  async disconnect() {
    await this.producer.disconnect()
  }

  async send(topic, message) {
    if (!this.isConnected) {
      await this.producer.connect()
      this.isconnected = true
    }

    return this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message)
        }
      ]
    })
  }
}

class KafkaConsumer extends KafkaClient {
  constructor() {
    super()
    this.isConnected = false
    this.topicsArray = []
    this.topicsDetails = {}
  }

  async disconnect() {
    await this.consumer.disconnect()
  }

  async subscribe(topic, topicRequestDetails) {
    if (this.topicsArray.includes(topic)) {
      throw Error(`Kafka topic - ${topic} already attached to another endpoint`)
    }

    // Subscriptions can not be done whilst the consumer is running. Workaround is to disconnect and connect again
    if (!this.isConnected) {
      await this.consumer.connect()
      this.isConnected = true
    } else {
      await this.consumer.stop()
    }

    const subscriptionOptions = {
      fromBeginning: true
    }
    if (this.topicsArray.length < 1) {
      subscriptionOptions.topic = topic
    } else {
      subscriptionOptions.topics = this.topicsArray.concat(topic)
    }

    await this.consumer.subscribe(subscriptionOptions)
    logger.info(`Successfully subcribed topic - ${topic} for kafka consumption`)

    this.topicsDetails[topic] = topicRequestDetails
    this.topicsArray.push(topic)

    await this.consumer.run({
      eachMessage: async ({topic, partition, message}) => {
        this.processKafKaMessage(topic, partition, message)
      }
    })
  }

  processKafKaMessage(topic, partition, message) {
    logger.info(
      `Received data from topic - ${topic} on partition - ${partition}`
    )

    axios({
      url: this.topicsDetails[topic].url,
      method: 'POST',
      headers: this.topicsDetails[topic].headers,
      data: message.value.toString()
    }).catch(() => {})
  }

  async unsubscribe(topic) {
    const newTopicsArray = this.topicsArray.filter(tpc => tpc !== topic)
    const subscriptionOptions = {
      fromBeginning: true
    }
    if (newTopicsArray.length === 1) {
      subscriptionOptions.topic = newTopicsArray[0]
    } else {
      subscriptionOptions.topics = newTopicsArray
    }
    await this.consumer.stop()

    await this.consumer.subscribe(subscriptionOptions)
    await this.consumer.run({
      eachMessage: async ({topic, partition, message}) => {
        this.processKafKaMessage(topic, partition, message)
      }
    })
    delete this.topicRequestDetails[topic]
    this.topicsArray = newTopicsArray

    logger.info(
      `Successfully unsubscribed topic ${topic} from kafka consumption`
    )
  }
}

module.exports = {
  KafkaConsumer,
  KafkaProducer
}
