---
id: kafka-integration
title: Kafka Integration
sidebar_label: Kafka Integration
---

This mediator has the ability to consume and produce to kafka. The details for accessing the kafka instance can be specified in the config file or via environment variables. Below is an example of the kafka config

```js
{
  "kafkaConfig": {
    "brokers": process.env.KAFKA_BROKERS || "localhost:9092",
    "clientId": process.env.KAFKA_CLIENTID || "mapping-mediator",
    "requestTimeout": process.env.KAFKA_REQUEST_TIMEOUT || 60000,
    "connectionTimeout": process.env.KAFKA_CONNECTION_TIMEOUT || 60000,
    "groupId": process.env.KAFKA_CONSUMER_GROUPID || "mapping-mediator"
  }
}
```

The topics to consume and produce to, can be specified in the endpoint schema like done below

```js
{
  "name": "External Request - Patient",
  "endpoint": {
    "pattern": "/Patient"
  },
  "transformation": {
    "input": "JSON",
    "output": "JSON"
  },
  "kafkaConsumerTopic": "2xx",
  "requests": {
    "response": [
      {
        "id": "fhirPatient",
         "kafkaProducerTopic": "3xx"
      }
    ]
  }
}

```
