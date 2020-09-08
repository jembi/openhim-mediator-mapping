---
id: validation
title: Validation
sidebar_label: Validation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Validation feature within each endpoints allows the implementer to define a definition of validation rules that the incoming payload needs to adhere to for it to be considered a valid payload. 
This features can be used completely on its own without having to execute any of the other features if you purely just want to validate a payload to ensure data quality.

Applying the validation feature is recommended but optional. The level of validation is completely configurable by the user. Any fields that don't require validation can be left out of the validation schema.

For the validation, the module [AJV](https://www.npmjs.com/package/ajv) is used. The validation schema has to be defined in a file named `input-validation.json` within your created subdirectory within `/endpoints`. By default, the values of the user's input properties can be set to `nullable`. To prevent any `null` values passing validation supply the following [environment variable](setup.md#environment-variables) **VALIDATION_ACCEPT_NULL_VALUES=false** on app start up. Below is an example of the validation schema.

## How does this work?

When creating a new `endpoint` you can supply a section called `inputValidation` to the root of the `endpoint` schema.

This object will contain the validation logic to be applied to the relevant data points

Below is an example of the structure of the AJV validation schema

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "surname": {"type": "string", "nullable": true},
    "emails": {"type": "array", "items": {"type": "string", "format": "email"}},
    "date": {"type": "string", "format": "date-time"},
    "id": {"type": "string", "format": "uuid"},
    "jobs": {
      "type": "object",
      "properties": {"marketing": {"type": "string"}},
      "required": ["marketing"]
    }
  },
  "required": ["name", "id", "emails"]
}
```

Data types such as `date`, `email`, `uuid`, etc. all inherit the type `string`. To specify the type, use the keyword `format` as seen above.

> The [formats](https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md#format) that are supported are: **date**, **date-time**, **uri**, **email**, **hostname**, **ipv6** and **regex**. More validation rules are available [here](https://www.npmjs.com/package/ajv#validation-keywords)

Data points that can be validated within the OpenHIM Mediator Mapping include:

  - requestBody
  - lookupRequests

## Validation in practice

The example is just to illustrate how to go about defining the payload validation for the incoming payload for a specific `endpoint`.

The below Validation settings defines the following

  - Validate on the incoming `requestBody` which should be an `Object`
  - Within the `requestBody` object we expect 4 required fields to be supplied
    - `id`: This incoming field is a required string value that needs to match on the supplied regular expression
    - `display`: This incoming field is a required string
    - `height`: This incoming field is a required string
    - `id`: This incoming field is a required number

<Tabs
  defaultValue="endpoint"
  values={
    [
      { label: 'Endpoint Schema', value: 'endpoint' },
      { label: 'Request', value: 'request' }
    ]
  }
>
<TabItem value="endpoint">

Below is a basic example of the `state` object within the `endpoint` schema

```json {6-9}
{
  "name": "A Sample Endpoint",
  "endpoint": {
    "pattern": "/sample-endpoint"
  },
  "transformation": {
    "input": "JSON",
    "output": "JSON"
  },
  "inputValidation": {
    "type": "object",
    "properties": {
      "requestBody": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "pattern": "[A-Za-z0-9\\-\\.]{1,64}"
          },
          "display": {
            "type": "string"
          },
          "height": {
            "type": "string"
          },
          "weight": {
            "type": "number"
          }
        },
        "required": ["id", "display", "height", "weight"]
      }
    }
  }
}
```

</TabItem>
<TabItem value="request">

The sample `inputValidation` schema definition shows us how the incoming payload will be validated to ensure data quality

Lets make use of a sample `payload.json` payload that will be sent to this endpoint to illustrate the validation of the payload

```json
{
  "uuid": "e6c2e4fd-fd90-401c-8820-1abb9713944a",
  "display": "Sample S Patient",
  "height": "1.77",
  "weight": "91"
}
```

The sample POST request to this endpoint would look like the below:

```curl
curl -X POST -d "@payload.json" -H "Content-Type: application/json" http://localhost:3003/sample-endpoint
```

</TabItem>
</Tabs>
