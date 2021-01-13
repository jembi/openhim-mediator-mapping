---
id: endpoints
title: Endpoints
sidebar_label: Endpoints
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Endpoint Configuration

Each `Endpoint` is configured independently with a schema stored in MongoDB.
The schemas are defined as JSON objects. Endpoints are added to the Mapping Mediator via its API.
In the example below, we post a simple example endpoint to our local API endpoint which defaults to <http://localhost:3003/endpoints>.

```sh
curl --location --request POST 'http://localhost:3003/endpoints' \
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

This is a RESTful API that supports POST, PUT, GET, and DELETE. Therefore, once an `Endpoint` has been created it can be retrieved, updated, and deleted. For more information, please see the [Mapping Mediator API](./api.md) documentation.

The schema can be broken down into 7 major areas of concern:

1. Metadata
1. Mapping
1. Constants
1. Validation
1. Transformation
1. Orchestration
1. State

### 1. Metadata

The `metadata` section contains the details involved for route setup. The following can be set in the root level of the config object:

- Endpoint `name`
- Endpoint `description`
- Route path `pattern`
- Route HTTP `method`
- Expected `input` message data type
- Desired `output` message data type

#### Route Path Pattern

This is the path on which the OpenHIM Mapping Mediator will listen to trigger a specific message mapping transformation. The path is specified in the endpoint `pattern` property. Url parameters are supported. The URL parameters can be used in the external requests and in the mapping. A request that matches on a pattern like `/path/:parameter1/:parameter2` will have the values of these parameters available for use in the external requests and mapping under variable names `parameter1` and `parameter2`.

#### Expected Input

Specify the expected input message type for this specific endpoint to allow the OpenHIM Mapping Mediator to successfully parse the incoming message for processing. Currently accepted formats are `JSON` and `XML`

#### Desired Output

Specify the desired output message type for this specific endpoint to allow the OpenHIM Mapping Mediator to parse the outgoing message. Currently accepted formats are `JSON` and `XML`

### 2. Mapping

The mapping schema in the `input-mapping.json` JSON document defines how the incoming data will be retrieved and used to build up a new object in the desired outcome.

The root structure of this input mapping schema consists of two properties as defined below

```javascript
{
  "input": { ... },
  "constants": { ... } // optional
}
```

The structure for both the properties are the same and are defined as below. Below is an example of the mapping

<Tabs
  defaultValue="input"
  values={
    [
      { label: 'Input', value: 'input' },
      { label: 'Mapping Schema', value: 'mapping' },
      { label: 'Output', value: 'output' },
    ]
  }
>
<TabItem value="input">

```js
{
  requestBody: {
    status: 'Active'
  },
  lookupRequests: {
    location: 'Unknown'
  }
}
```

</TabItem>
<TabItem value="mapping">

```json
{
  "input": {
    "requestBody.status": "status",
    "lookupRequests.location": "location"
  }
}
```

</TabItem>
<TabItem value="output">

```js
{
  status: 'Active',
  location: 'Unknown'
}
```

</TabItem>
</Tabs>

### 3. Constants

The constants section contains data to be used alongside the client input data. This contains values for fields required in the output data that weren't available from the original client input.

Fields in constants can only be referenced in the transformation, orchestration and mapping sections of the Endpoint schema. See below for a simple example:

<Tabs
  defaultValue="definition"
  values={
    [
      { label: 'Constants Definition', value: 'definition' },
      { label: 'Constants Reference', value: 'reference' },
      { label: 'Output', value: 'output' },
    ]
  }>
  <TabItem value="definition">

Here we define two constants.

```json
"constants": {
  "first_constant": "world",
  "second_constant": 3.1415
}
```

  </TabItem>
    <TabItem value="reference">

The constants are mapped to new output fields `hello` and `pi` respectively.

```json
  "inputMapping": {
    "constants.first_constant": "hello",
    "constants.second_constant": "pi",
  }
```

  </TabItem>
    <TabItem value="output">

The output object then contains constant data independent of the input request data.

```json
{
  "hello": "world",
  "pi": 3.1415
}
```

  </TabItem>
</Tabs>

### 4. Validation

The data from the input request as well as any lookup requests can be validated before the mapping occurs. Below is a sample of a validation schema:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "weight": {
      "type": "number",
      "min": 0.1,
      "max": 650,
      "errorMessage": "Weight must be a number between 0.1 and 650"
    }
  },
  "required": ["name"]
}
```

This schema will verify a message contains a **required** field called `name` of type string and an **optional** field called `weight` that if provided, is a number within the range 0.1 to 650.

For more details, see the [validation page](../features/validation.md).

### 5. Transformation

The transformation step allows data to undergo complex changes before the mapping step. The Mapping Mediator makes use of the [JSONata library](http://docs.jsonata.org/overview.html) to perform transformations. Transformed data and the original input are both available to be mapped in the mapping step.

<Tabs
  defaultValue="input"
  values={
    [
      { label: 'Input', value: 'input' },
      { label: 'Transformation Reference', value: 'reference' },
      { label: 'Output', value: 'output' },
    ]
  }>
  <TabItem value="input">

Here we define two constants.

```json
{
  "first_field": "world",
  "second_field": 3.1415
}
```

  </TabItem>
    <TabItem value="reference">

The transform schema definition:

```json
  "inputTransforms": {
    
  },
  "inputMapping": {
    "constants.first_constant": "hello",
    "constants.second_constant": "pi",
  }
```

  </TabItem>
    <TabItem value="output">

The output object then contains constant data independent of the input request data.

```json
{
  "hello": "world",
  "pi": 3.1415
}
```

  </TabItem>
</Tabs>

For more details check out [transformation](../features/transformation)

### 6. Orchestrations

This feature allows for data lookups from external services and the sending of the mapped data to external services. The data to look up and the services where the result of the mapping should be sent are specified in the `meta.json`. The data looked up is aggregated with the input data before the validation is done. Below is a sample of a `meta.json`

```json
{
  "name": "Test",
  "endpoint": {
    "pattern": "/test"
  },
  "transformation": {
    "input": "XML",
    "output": "JSON"
  },
  "requests": {
    "lookup": [
      {
        "id": "1223",
        "forwardExistingRequestBody": true,
        "config": {
          "method": "get",
          "url": "http://localhost:3444/encounters/",
          "params": {
            "query": {
              "id": {
                "path": "payload.id",
                "prefix": "",
                "postfix": ""
              },
              "address":{
                "path": "query.location",
                "prefix": "",
                "postfix": ""
              }
            }
          }
        }
      }
    ],
    "response": [
      {
        "id": "4433",
        "config": {
          "method": "post",
          "url": "http://localhost:3456/encounters?msn=23",
          "params": {
            "query": {
              "place":{
                "path": "payload.location[0].code",
                "prefix": "",
                "postfix": ""
              },
              "code": {
                "path": "query.unit",
                "postfix": "",
                "prefix": ""
              }
            }
          }
        }
      }
    ]
  }
}
```

There are two types of external requests, the `lookup` and the `response`. Query parameters for the external request can be dynamically populated

<Tabs
  defaultValue="lookup"
  values={
    [
      { label: 'Lookup', value: 'lookup' },
      { label: 'Response', value: 'response' },
      { label: 'Query and URL parameters', value: 'query' },
      { label: 'ForEach requests', value: 'forEach' },
    ]
  }>
  <TabItem value="lookup">

  You can fetch data that you want to map. The retrieved data will be aggregated with the input data supplied in the request body. The following shows the aggregation

  ```json
  Lookup request:

  {
    "requests": {
      "lookup": [
        {
          "id": "location",
          "config": {
            "method": "get",
            "url": "http://localhost:3444/location/1",
            "params": {
              "query": {
                "id": {
                  "path": "payload.id"
                }
              }
            }
          }
        }
      ]
    }
  }


  The aggregated input that will be validated and then mapped will look like below


  {
    lookupRequests: {
      location: <Result from lookup>
    },
    responseBody: {}
  }
  ```

  </TabItem>

  <TabItem value="response">

  The result of the mapping can be orchestrated to external services. The result that will be sent back to the user is the response from the external services. If the mapped data is being orchestrated to multiple services, the response sent back is an aggregation of the responses from the multiple services unless one of the external requests is set to be the `primary`.

  The examples below show the expected responses when there is a primary request and when there is not.

  ```json
  Primary request specified:

  {
    "requests": {
      "response": [
        {
          "id": "dhis",
          "config": {
            "method": "get",
            "url": "http://localhost:3444/encounters/1",
            "params": {
              "query": {
                "id": {
                  "path": "payload.id",
                  "prefix": "",
                  "postfix": ""
                }
              }
            }
          }
        },
        {
          "id": "redcap",
          "config": {
            "method": "get",
            "url": "http://localhost:3444/encounters/1",
            "params": {
              "query": {
                "id": {
                  "path": "payload.id",
                  "prefix": "",
                  "postfix": ""
                }
              }
            },
            "primary": false
          }
        }
      ]
    }
  }
  ```

  ```js
  Expected response:

  {
    body: {
      dhis: 'Response from dhis',
      redcap: 'Response from redcap'
    }
  }
  ```

  If one request has the property primary set to true or when there is only one request, the expected response is what is shown below

  ```js
  {
    body: 'Response body'
  }
  ```

  </TabItem>
  <TabItem value="query">

  The query or URL parameters for the external requests can be populated from the incoming request's body and query object. The parameters to be added can be specified in the `meta.json` as shown below in config `params` object

  ```json
  {
    "requests": {
      "lookup": [
        {
          "id": "iscec",
          "config": {
            "method": "get",
            "url": "http://localhost:3444/encounters/:encounterId",
            "params": {
              "query": {
                "id": {
                  "path": "payload.id",
                  "prefix": "prefix",
                  "postfix": "postfix"
                }
              },
              "url": {
                "encounterId": {
                  "path": "payload.encounterId"
                }
              }
            }
          }
        }
      ]
    }
  }
  ```

  The `id` is the name of the query parameter. The `path` is the location of the value of the parameter in the incoming request body or query object. For values retrieved from the request body the `path` is specified by prefixing the path with the key word `payload` and for retrieving from the query the keyword is `query`. Below are examples of paths

  ```json
  {
    "config": {
      "params": {
        "query": {
          "id": {
            "path": "payload.ids[0].nationalId"
          },
          "name": {
            "path": "query.name"
          }
        }
      }
    }
  }
  ```

  The properties `postfix` and `prefix` are optional. An example use case is given below

  For a query parameter that has the following format `code:<Facility code>:section:52`, if we are retrieving the `Facility code` from the payload or query we can specify this as shown below

  ```json
  {
    "params": {
      "query": {
        "filter": {
          "path": "payload.facility_code",
          "prefix": "code:",
          "postfix": ":section:52"
        }
      }
    }
  }
  ```

  If say the facility code in the payload is **1223**, the specification above will enable us to have a query parameter - **?filter=code:1223:section:52**

  For URL parameter the name of the parameter must be included in the url with a `:` prefix. This parameter will be replaced in the URL at runtime with the value that you specify. For example:

  ```json
  {
    "requests": {
      "lookup": [
        {
          "id": "iscec",
          "config": {
            "method": "get",
            "url": "http://localhost:3444/encounters/:encounterId",
            "params": {
              "url": {
                "encounterId": {
                  "path": "payload.encounterId"
                }
              }
            }
          }
        }
      ]
    }
  }
  ```

  If the original request's payload had a `encounterId` property of `2442` then the url would become: `http://localhost:3444/encounters/2442`
  </TabItem>

  <TabItem value="forEach">

  Both lookups and responses support ForEach requests. These are requests that are executed for each element in an array variable. The configuration for these requests is done using the `forEach` property on the request object as shown below:

  ```js {5-8}
  {
    "lookup": [
      {
        "id": "test",
        "forEach": {
          "items": "payload.entry",
          "concurrency": "2" // if not specified default to 1
        },
        "config": {
        }
      }
    ]
  }
  ```

  Configuration reference:

  `items`: this is the path to any stored variable which must resolve to an array, a request will fire for each array element
  `concurrency`: (optional) how many requests to execute at any one time, defaults to 1.

  The current item in the list is also made available as a variable for the requests to use so that each request may be dynamic. E.g:

  ```js {9,13}
  {
    id: 'fhirPatient',
    forwardExistingRequestBody: true,
    forEach: {
      items: 'payload.test'
    },
    config: {
      method: 'post',
      url: `http://localhost:8080/Patient/:id`,
      params: {
        url: {
          id: {
            path: 'item.id'
          }
        }
      }
    }
  }
  ```

  </TabItem>
</Tabs>

### 7. State
