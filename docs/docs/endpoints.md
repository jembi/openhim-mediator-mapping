---
id: endpoints
title: Endpoints
sidebar_label: Endpoints
---

## Configuration files

The configuration files must be stored in a directory in the root of the project named endpoints. This endpoints directory should be further broken down into sub-directories each containing a minimum of four specific files: `meta.json`, `input-mapping.json`, `input-validation.json`, and `constants.json`. `output.json` is optional at this point. The endpoints directory should be in the following structure:

```txt
├── Endpoints
    ├── Example Patient Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
    ├── Example Observation Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
    ├── Example Different Patient Mapping
        ├── constants.json (optional)
        ├── input-mapping.json
        ├── input-validation.json
        ├── meta.json
        ├── output.json (optional)
```

### 1. Meta Data

The `meta.json` file contains the details involved for route setup. The following can be set in the `meta.json` file:

- Mapping route path
- Expected **input** message type
- Desired **output** message type

#### Mapping Route Path

This is the path on which the OpenHIM Mapping Mediator will listen to trigger a specific message mapping transformation.

#### Expected Input

Specify the expected input message type for this specific endpoint to allow the OpenHIM Mapping Mediator to successfully parse the incoming message for processing. Current accepted formats are `JSON` and `XML`

#### Desired Output

Specify the desired output message type for this specific endpoint to allow the OpenHIM Mapping Mediator to successfully parse the outgoing message. Current accepted formats are `JSON` and `XML`

### 2. Input Validation Schema

To ensure good data quality, the Mapping mediator implements a validation middleware layer. This middleware layer will validate the user's input before mapping the output object. Applying the validation middleware is recommended but optional. The level of validation is completely configurable by the user. Any fields that don't require validation can be left out of the validation schema.

For the validation, the module [AJV](https://www.npmjs.com/package/ajv) is used. The validation schema has to be defined in a file named `input-validation.json` within your created subdirectory within `/endpoints`. By default, the values of the user's input properties can be set to `nullable`. To prevent any `null` values passing validation supply the following environment variable **VALIDATION_ACCEPT_NULL_VALUES=false** on app start up. Below is an example of the validation schema.

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

### 3. Input Mapping Schema

The mapping schema in the `input-mapping.json` JSON document defines how the incoming data will be retrieved and used to build up a new object in the desired outcome.

The basic structure of this schema is `key:value` based. This means that the `key` of the object defines where to look for a value from the incoming document, and the `value` of that `key` defines where to populate/build the new property on the outgoing document.

The root structure of this input mapping schema consists of two properties as defined below

```javascript
{
  "input": { ... },
  "constants": { ... } // optional
}
```

The root `input` property is used to define the mapping of the incoming document and populate/build the outgoing object. The `constants` property is used to make reference to the `constants.json` schema for using static values that do not come from the incoming document.

The structure for both these properties are the same and are defined as below.

```javascript
{
  "input": {
    "rootProperty": "rootProperty", // map incoming root property to an outgoing root property
    "rootObject.object1.object2.property": "rootObject.property", // map incoming nested property to an outgoing nested property
    "array[]": "array", // map incoming root array to an outgoing array.
    "rootArray[1]": "rootArray[1]", // map incoming root array at index 1 to an outgoing array at index 1 (useful when using an output.json template to override a specific index value).
    "rootArray[].property": "rootArray[].property", // map all incoming array nested property to an outgoing array nested property. Note: not specifying an index for the array will push in the new value, instead of overriding it at the specified index
    "rootArray[1].property": "rootArray[1].property", // map incoming array nested property at index 1 to an outgoing array nested property at index 1 (useful when using an output.json template to override a specific index value).
    "rootObject.array[].property": "rootObject.object1.array[].property", // map incoming property that is an array of objects to an outgoing object with a nested object containing an array of objects
  }
}
```

### 4. Constants

The constants file contains data to be used alongside the client input data. The constants file can contain values for fields required in the output data that weren't available from the original client input.

Fields in the constants file can be referenced in the mapping schema in the `constants` section similar to the user input mapping.

### 5. Output

---
