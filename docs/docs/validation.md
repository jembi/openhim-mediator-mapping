---
id: validation
title: Validation
sidebar_label: Validation
---

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