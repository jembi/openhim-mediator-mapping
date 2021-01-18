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

The `metadata` section contains the details involved in route setup. The following can be set in the root level of the config object:

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

The mapping schema is defined within the `input-mapping`field. This section defines how the incoming data will be used to build up a new object in the desired structure. Our mapping is done using the [node object mapper library](https://github.com/jembi/node-object-mapper).

Every mapping field in this section follows this pattern

```json
{
  "path.to.input.data": "path.to.output.field"
}
```

#### Data available for mapping

All input data, populated from different sources, are stored in the following internal object structure:

```json
{
  "requestBody": {...},
  "lookupRequests": {...},
  "transforms": {...},
  "constants": {...},
  "urlParams": {...},
  "state": {...},
  "timestamps": {...},
}
```

See the full flow of examples to follow:

<Tabs
  defaultValue="input"
  values={
    [
      { label: 'Input Data', value: 'input' },
      { label: 'Mapping Schema', value: 'mapping' },
      { label: 'Output', value: 'output' },
    ]
  }
>
<TabItem value="input">

```json
{
  "requestBody": {
    "status": "Active"
  },
  "lookupRequests": {
    "location": "Unknown"
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

```json
{
  "status": "Active",
  "location": "Unknown"
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

The data from the input request as well as any lookup requests can be validated before the mapping occurs. We use the [ajv library](https://ajv.js.org/) to handle our validation. Below is a sample of a validation schema:

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

> Note: Transformed data will not be included in the output data unless it is mapped to an output field

<Tabs
  defaultValue="input"
  values={
    [
      { label: 'Input Data', value: 'input' },
      { label: 'Transformation Reference', value: 'reference' },
      { label: 'Output', value: 'output' },
    ]
  }>
  <TabItem value="input">

Here we define two input request fields.

```json
{
  "radius": "10",
  "subject": "world"
}
```

  </TabItem>
    <TabItem value="reference">

The transform schema definition:

```json {2,3}
  "inputTransforms": {
    "areaOfObject": "(constants.pi * requestBody.radius * requestBody.radius) & 'cm³'",
    "capsSubject": "$uppercase( requestBody.subject )"
  },
  "inputMapping": {
    "transforms.capsSubject": "HELLO",
    "transforms.areaOfObject": "mediumPizzaArea",
  },
  "constants": {
    "pi": 3.1415
  }
```

  </TabItem>
    <TabItem value="output">

The output object then contains the transformed and mapped data

```json
{
  "HELLO": "WORLD",
  "mediumPizzaArea": "314.15cm³"
}
```

  </TabItem>
</Tabs>

For more details check out [transformation](../features/transformation)

### 6. Orchestrations

This feature allows for data lookups from external services and the sending of the mapped data to external services.
The data to look up and the services where the result of the mapping should be sent are specified in the `requests` section.
The data looked up is aggregated with the input data before the validation is done. Response data is not validated before being sent.
For more orchestrations details please see the [Orchestrations feature documentation](../features/orchestration).
Below is an extract of some request orchestrations.

```json
{
  ...
  "requests": {
    "lookup": [
      {
        "id": "dhis2",
        "config": {
          "method": "get",
          "url": "https://play.dhis2.org/2.35/api/organisationUnits.json?paging=false",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Basic YWRtaW46ZGlzdHJpY3Q="
          }
        }
      }
    ],
    "response": [
      {
        "id": "hapi-fhir",
        "config": {
          "method": "post",
          "url": "http://hapi.fhir.org/baseR4/",
          "headers": {
            "Content-Type": "application/json"
          }
        }
      }
    ]
  }
}
```

In the example above, the lookup request gets facility data from DHIS2. That data would then be mapped (schema not shown for brevity) and the output data sent to a FHIR server. These requests can include query and url parameters which can be extracted from incoming data. Chaining together endpoint calls using this orchestration mechanism can lead to very complex logic being implemented.

There are two types of external requests, the `lookup` and the `response`. Query and url parameters for the external request can be dynamically populated

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

  You can fetch data to map. The retrieved data will be aggregated with the input data supplied in the request body. The following shows the aggregation

  ```json {7}
  Lookup request:

  {
    "requests": {
      "lookup": [
        {
          "id": "dhis2",
          "config": {
            "method": "get",
            "url": "https://play.dhis2.org/2.35/api/organisationUnits.json?paging=false",
            "headers": {
              "Content-Type": "application/json",
              "Authorization": "Basic YWRtaW46ZGlzdHJpY3Q="
            }
          }
        }
      ]
    }
  }
  ```

  The data retrived from the lookup request will be aggregated inside the lookupRequests object using its id as the nested field name. The full list off input data available for mapping is listed [above](#data-available-for-mapping).

```json
  {
    ...
    "lookupRequests": {
      "dhis2": {
        ...
        //<Data from lookup>
      }
    }
  }
  ```

  </TabItem>

  <TabItem value="response">

  The result of the mapping can be orchestrated to external services.
  The result that will be sent back to the user in the response from the external services.
  If the mapped data is being orchestrated to multiple services, the response sent back is an aggregation of the responses from the multiple services unless one of the external requests is set to be the `primary`.

  The examples below show the expected responses when there is a primary request and when there is not.

  ```json
  //Primary request specified
  {
    "requests": {
      "response": [
        {
          "id": "dhis",
          "config": {
            "method": "post",
            "url": "http://localhost:3000/example/",
          }
        },
        {
          "id": "redcap",
          "config": {
            "method": "post",
            "url": "http://localhost:3444/example/",
            "primary": false
          }
        }
      ]
    }
  }
  ```

  ```json
  // Expected response:
  {
    "body": {
      "dhis": {
        ...
        // Response from dhis
      },
      "redcap": {
        ...
        // Response from redcap
      }
    }
  }
  ```

  If one request has the property primary set to true or when there is only one request, the expected response is what is shown below

  ```js
  {
    body: {
    ...
     // Primary Response body
    }
  }
  ```

  </TabItem>
  <TabItem value="query">

  The query or URL parameters for the external requests can be populated from the incoming request's body and query object.
  The parameters to be added can be specified in the lookup config as shown below in the `params` object.

  ```json
  {
    ...
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

  The `id` is the name of the query parameter. The `path` is the location of the value of the parameter in the incoming request body or query object.
  For values retrieved from the request body the `path` is specified by prefixing the path with the key word `payload` and for retrieving from the query the keyword is `query`.
  Below are examples of paths.

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

  The properties `postfix` and `prefix` are optional.
  For a query parameter that has the following format `code:<Facility code>:section:52`, if we are retrieving the `Facility code` from the payload or query we can specify this as shown below.

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

  If for example the facility code in the payload is **1223**, the specification above will enable us to have a query parameter - **?filter=code:1223:section:52**

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

  ```json {5-8}
  {
    "lookup": [
      {
        "id": "test",
        "forEach": {
          "items": "payload.entry",
          "concurrency": "2" // if not specified defaults to 1
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

  ```json {9,13}
  {
    "id": "fhirPatient",
    "forwardExistingRequestBody": true,
    "forEach": {
      "items": "payload.test"
    },
    "config": {
      "method": "post",
      "url": "http://localhost:8080/Patient/:id",
      "params": {
        "url": {
          "id": {
            "path": "item.id"
          }
        }
      }
    }
  }
  ```

  </TabItem>
</Tabs>

### 7. State

The state management configuration is a useful feature when the results of previous requests influence details within the current request.
For example, say you want to poll for recent data within a range - using the endpoint state you could store when the last time this Endpoint was triggered and use that state value as the timestamp within your period request.
Please see the [feature documentation](../features/state-management) for an in-depth look at Endpoint State.

In the example below, we are extracting two fields to be stored on the Endpoint State. The organisationId is taken from the current requestBody. The pageNumber is taken from the current page query value.

```json {6,9}
{
  ...
  "state": {
  "extract": {
    "requestBody": {
      "organisationId": "organisation[0].facilityId"
    },
    "query": {
      "pageNumber": "page"
    }
  }
}
```

In the next request to this stateful endpoint the previous requests values will be available within the full list off input data available for mapping is listed [above](#data-available-for-mapping). The two stored fields would be available as follows:

```json {7-14}
{
  "requestBody": {...},
  "lookupRequests": {...},
  "transforms": {...},
  "constants": {...},
  "urlParams": {...},
  "state": {
    "requestBody": {
      "organisationId": "<id_value"
    },
    "query": {
      "pageNumber": "<page_number_value>"
    }
  },
  "timestamps": {...},
}
```

Therefore to reference the value in a schema for example you could use the follow:

```json {13,18}
{
  ...
  "requests": {
    "lookup": [
      {
        "id": "organisation-details",
        "config": {
          "method": "get",
          "url": "https://play.dhis2.org/2.35/api/organisationUnits/:org-id",
          "params": {
            "url": {
              "org-id": {
                "path": "state.requestBody.organisationId"
              }
            },
            "query": {
              "pageNumber": {
                "path": "state.query.pageNumber"
              }
            }
          }
        }
      }
    ]
  }
}
```

This would result in a url with this format:

```http
https://play.dhis2.org/2.35/api/organisationUnits/<id_value>?pageNumber=<page_number_value>
```
