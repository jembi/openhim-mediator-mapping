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

The `/endpoints` path is used to interact with endpoint schemas. Please import [our Postman Collection](https://www.getpostman.com/collections/de9443595ebafe610460) for a more visual interaction with our examples. [Postman](https://www.postman.com/features/mock-api/) is a useful tool for testing out your config files as request data is easy to manipulate and save within the app.

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

Response body below.

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
   "_id":"60045c90cb78062ab5bdec85",
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

This GET request will return a list of all existing Endpoints.

```sh
curl 'http://localhost:3003/endpoints'
```

Response body below. Note that it is a list.

```json
[
   {
      "endpoint":{
         "method":"GET",
         "pattern":"/example"
      },
      "transformation":{
         "input":"JSON",
         "output":"JSON"
      },
      "requests":{
         "lookup":[
            
         ],
         "response":[
            
         ]
      },
      "state":{
         "config":{
            "networkErrors":"no-filter",
            "includeStatuses":[
               
            ]
         }
      },
      "_id":"60045c90cb78062ab5bdec85",
      "name":"Endpoint Example",
      "inputMapping":{
         "constants.example_constant":"hello"
      },
      "constants":{
         "example_constant":"world!"
      },
      "createdAt":"2021-01-17T15:49:36.877Z",
      "updatedAt":"2021-01-17T15:49:36.877Z",
      "__v":0
   }
]
```

#### GET one

For a specific Endpoint's details substitute its ID into the URL param below.

```sh
curl 'http://localhost:3003/endpoints/{Endpoint_ID}'
```

Response body below.

```json
{
   "endpoint":{
      "method":"GET",
      "pattern":"/example"
   },
   "transformation":{
      "input":"JSON",
      "output":"JSON"
   },
   "requests":{
      "lookup":[
         
      ],
      "response":[
         
      ]
   },
   "state":{
      "config":{
         "networkErrors":"no-filter",
         "includeStatuses":[
            
         ]
      }
   },
   "_id":"60045c90cb78062ab5bdec85",
   "name":"Endpoint Example",
   "inputMapping":{
      "constants.example_constant":"hello"
   },
   "constants":{
      "example_constant":"world!"
   },
   "createdAt":"2021-01-17T15:49:36.877Z",
   "updatedAt":"2021-01-17T15:49:36.877Z",
   "__v":0
}
```

### PUT

The PUT request is used to update a specific Endpoint's config. In the example below we are adding a new constant and an inputMapping field.
In the URL substitute in the Endpoint ID into the URL Param.

```sh
curl --request PUT 'http://localhost:3003/endpoints/{Endpoint_ID}' \
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
        "constants.example_constant": "hello",
        "constants.new_constant": "foo"
    },
    "constants": {
        "example_constant": "world!",
        "new_constant": "bar"
    }
}'
```

Response Body below.

```json
{
   "endpoint":{
      "method":"GET",
      "pattern":"/example"
   },
   "transformation":{
      "input":"JSON",
      "output":"JSON"
   },
   "requests":{
      "lookup":[
         
      ],
      "response":[
         
      ]
   },
   "state":{
      "config":{
         "networkErrors":"no-filter",
         "includeStatuses":[
            
         ]
      }
   },
   "_id":"60045c90cb78062ab5bdec85",
   "name":"Endpoint Example",
   "inputMapping":{
      "constants.example_constant":"hello",
      "constants.new_constant":"foo"
   },
   "constants":{
      "example_constant":"world!",
      "new_constant":"bar"
   },
   "createdAt":"2021-01-17T15:49:36.877Z",
   "updatedAt":"2021-01-17T16:09:17.896Z",
   "__v":0
}
```

### DELETE

The delete request is used to completely remove an endpoint. Substitute in an Endpoint ID to delete it.

```sh
curl --request DELETE 'http://localhost:3003/endpoints/{Endpoint_ID}'
```

Response body below.

```json
{"message":"Endpoint with ID '60045c90cb78062ab5bdec85' deleted"}
```
