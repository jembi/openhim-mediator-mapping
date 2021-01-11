---
id: content-negotiation
title: Content Negotiation
sidebar_label: Content Negotiation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Content Negotiation feature within each endpoints allows the implementer to define the `Content-Type` of the incoming request payload to ensure the correct formatted data is being sent, as well as to define the `Content-Type` of the outgoing response payload.

This features can be used completely on its own without having to execute any of the other features if you purely just want to convert a document from one format to another.

Supported Content Types:

- JSON
- XML

## How does this work?

When creating a new `endpoint` you can supply a section called `transformation` to the root of the `endpoint` schema.

This object will contain the `Content-Type` for both the `input` and `output` payloads

## Content Negotiation in practice

The example is just to illustrate how to go about defining the payload `Content-Type` for both incoming and outgoing payloads for a specific `endpoint`.

The below Content Negotiation settings accepts an incoming payload in `XML` format and then converts it into `JSON` for the response payload

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
    "input": "XML",
    "output": "JSON"
  }
}
```

</TabItem>
<TabItem value="request">

The sample `transformation` schema definition shows us how we go about converting the `input` and `ouptut` payloads of the `endpoint` request

Lets make use of a sample `payload.xml` document that will be sent to this endpoint to illustrate the transformation of the payload

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <uuid>e6c2e4fd-fd90-401c-8820-1abb9713944a</uuid>
  <display>Sample S Patient</display>
  <height>1.77</height>
  <weight>91</weight>
</root>
```

The sample POST request to this endpoint would look like the below:

```curl
curl -X POST -d "@payload.xml" -H "Content-Type: application/xml" http://localhost:3003/sample-endpoint
```

</TabItem>
</Tabs>
