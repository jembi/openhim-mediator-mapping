---
id: transformation
title: Transformation
sidebar_label: Transformation
---

For the transformation, a mapping schema in the `input-mapping.json` JSON document has to be created and this schema defines how the incoming data will be retrieved and used to build up a new object with the desired outcome.

The basic structure of this schema is `key:value` based. This means that the `key` of the object defines where to look for a value from the incoming document, and the `value` of that `key` defines where to populate/build the new property on the outgoing document.

The root structure of this input mapping schema consists of two properties as defined below

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
