---
id: api
title: Mapping Mediator API
sidebar_label: Mapping Mediator API
---

There are two default reserved API paths within the Mapping Mediator. The first is the `/uptime` path and the second is the `/endpoints` path.

## Uptime

Uptime only accepts GET requests. i.e:

```sh
curl http://localhost:3003/uptime
```

The previous command should give you a response in this format:

```json
{"milliseconds": 123456}
```

## Endpoints

The `/endpoints` path is used to interact with endpoint schemas. Please see [our Postman Collection](https://www.getpostman.com/collections/de9443595ebafe610460) for all our examples. [Postman](https://www.postman.com/features/mock-api/) is a useful tool for testing out your config files as request data is easy to manipulate and save within the app.

The following HTTP methods are supported.

### POST

To create a new endpoint schema POST your JSON data to the `/endpoints` path.

```sh
curl --request POST 'http://localhost:3003/endpoints' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Endpoint Example",
    "endpoint": {
        "pattern": "/example",
        "method": "GET"
    },
    "transformation": {
        "input": "JSON",
        "output": "JSON"
    },
    "inputMapping": {
      "constants.example_constant":"hello"
    },
    "constants": {
      "example_constant": "world!"
    }
}'
```

You should receive the following in the response body:

```json
{
   "endpoint":{
      "method":"GET",
      "pattern":"/example"
   },
   "requests":{
      "lookup":[],
      "response":[]
   },
   "state":{
      "config":{
         "networkErrors":"no-filter",
         "includeStatuses":[]
      }
   },
   "_id":"5ffedfc0b79894683d3c9867",
   "name":"Endpoint Example",
   "transformation":{
      "input":"JSON",
      "output":"JSON"
   },
   "inputMapping":{
      "constants.example_constant":"hello"
   },
   "constants":{
      "example_constant":"world!"
   },
   "createdAt":"2021-01-13T11:55:44.168Z",
   "updatedAt":"2021-01-13T11:55:44.168Z",
   "__v":0
}
```

Take note of the uuid in the `_id` field. This Endpoint ID will be used for other API interactions.

> Note: The response body will contain many **default configurations** if they were not specified in the create message.

### GET

A GET request will return Endpoint Configs. This can be useful to get an existing Endpoint's ID.

#### GET all

curl 'http://localhost:3003/endpoints'

#### GET one

curl 'http://localhost:3003/endpoints/{Endpoint_ID}'

### PUT

curl --request PUT 'http://localhost:3003/endpoints/{Endpoint_ID}'

### DELETE

curl --request DELETE 'http://localhost:3003/endpoints/{Endpoint_ID}'
