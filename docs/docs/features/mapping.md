---
id: mapping
title: Mapping
sidebar_label: Mapping
---

For the mapping, a `inputMapping` section in the Endpoint schema has to be added and this defines how the incoming data will be used to build up a new object with the desired structure.

The basic structure of this schema is `key:value` based. This means that the `key` of the object defines where to look for a value from the incoming document, and the `value` of that `key` defines where to populate/build the new property on the outgoing document.
The root `inputMapping` property is used to define the mapping of the incoming document and populate/build the outgoing object.

The example below lists the different mapping syntax available:

```json
{
  "inputMapping": {
    "rootProperty": "rootProperty", // map incoming root property to an outgoing root property
    "rootObject.object1.object2.property": "rootObject.property", // map incoming nested property to an outgoing nested property
    "array[]": "array", // map incoming root array to an outgoing array.
    "rootArray[1]": "rootArray[1]", // map incoming root array at index 1 to an outgoing array at index 1 (useful when using an output.json template to override a specific index value).
    "rootArray[].property": "rootArray[].property", // map all incoming array nested property to an outgoing array nested property. Note: not specifying an index for the array will push in the new value, instead of overriding it at the specified index
    "rootArray[1].property": "rootArray[1].property", // map incoming array nested property at index 1 to an outgoing array nested property at index 1 (useful when using an output.json template to override a specific index value).
    "rootObject.array[].property": "rootObject.object1.array[].property" // map incoming property that is an array of objects to an outgoing object with a nested object containing an array of objects
  }
}
```

## Mapping Transforms

> The mapping stage has its own set of limited transformations

The mapping step has access to a few simple transformations to help get data into the right format for your use case.
These transforms are based on functions available within the [mapping library](https://github.com/jembi/node-object-mapper/tree/master/src/transform).

### Arrays

#### oneToAllElements

The use case here is to add a constant piece of data to every element within an array.
This is useful for creating a predefined output message structure.
This function is needed as the regular mapping syntax maps one field to one other field.
For example, to add the constant `resourceType` field to every entry in a FHIR Bundle.

```json
  "constants": {
    "entry": {
      "resourceType": "Location"
    }
  },
  "inputMapping": {
    "constants.entry.resourceType": {
      "key": "entry[].resource.resourceType",
      "transform": {
        "function": "oneToAllElements"
      }
    }
  }
```

The sample code above will add the resourceType **Location** to every resource object in the entry array.

#### appendArray

This function will append array data from one to array to another array.

```json
"inputMapping": {
  "lookupRequests.test.testArray[]": {
    "key": "consolidated[]",
    "transform": {
      "function": "appendArray"
    }
  }
}
```

In the example above, the `testArray` from the lookup request will be appended to the output array field `consolidated`.

The mapping syntax also has array building functionality for example:

```json
"inputMapping": {
  "lookupRequests.test.testArray[]": "consolidated[]+"
}
```

However, the syntax above would add the entire `testArray` as a single element to the `consolidated` array field.

### Code Mapping

#### mapCodes

This function can be used to switch a known set of system codes with corresponding values or vice versa. To use the function, provide the key value pairs of all the possibilities in the `parameters` object.

```json
"inputMapping": {
  "requestBody.person.gender": {
    "key": "gender",
    "transform": {
      "function": "mapCodes",
      "parameters": {
        "F": "female",
        "M": "male",
        "O": "other",
        "default": "unknown",
        "null": null
      }
    }
  }
}
```

In the example above, the input gender codes will be output as words on the gender field.
