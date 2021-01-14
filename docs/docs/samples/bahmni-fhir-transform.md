---
id: bahmni-fhir-transform
title: Bahmni to FHIR transformation
sidebar_label: Bahmni to FHIR transformation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExternalContentSyntaxHighlighter from '../../src/components/ExternalContentSyntaxHighlighter.jsx';

This sample endpoint demonstrates how to perform validation/transformation on an incoming Bahmni Patient object and construct a new output object as a FHIR Patient resource

## Setup

Before we can continue with the sample endpoint configuration, we need to ensure we have followed the [getting started](../gettingStarted/setup.md) steps so that we have a working version of the mapping mediator.

Copy the [bahmni](https://github.com/jembi/openhim-mediator-mapping/tree/master/samples/endpoints/bahmni) directory to the [endpoints](https://github.com/jembi/openhim-mediator-mapping/tree/master/endpoints) directory.

The server will require a restart for the new endpoint files to be initialized and the endpoint successfully created.

## Config

Below are the various endpoint configuration files that was copied into the `endpoints/bahmni` directory.

<Tabs
  defaultValue="metadata"
  values={
    [
      { label: 'Metadata', value: 'metadata' },
      { label: 'Constants', value: 'constants' },
      { label: 'Input Validation', value: 'input-validation' },
      { label: 'Input Mapping', value: 'input-mapping' }
    ]
  }>
  <TabItem value="metadata">
    <ExternalContentSyntaxHighlighter
      url="https://raw.githubusercontent.com/jembi/openhim-mediator-mapping/master/samples/endpoints/bahmni/constant.json"
      language="json"
    />
  </TabItem>
  <TabItem value="constants">
    <ExternalContentSyntaxHighlighter
      url="https://raw.githubusercontent.com/jembi/openhim-mediator-mapping/master/samples/endpoints/bahmni/constant.json"
      language="json"
    />
  </TabItem>
  <TabItem value="input-validation">
    <ExternalContentSyntaxHighlighter
      url="https://raw.githubusercontent.com/jembi/openhim-mediator-mapping/master/samples/endpoints/bahmni/constant.json"
      language="json"
    />
  </TabItem>
  <TabItem value="input-mapping">
    <ExternalContentSyntaxHighlighter
      url="https://raw.githubusercontent.com/jembi/openhim-mediator-mapping/master/samples/endpoints/bahmni/constant.json"
      language="json"
    />
  </TabItem>
</Tabs>

## Testing

Once all the relevant configuration has been completed and the endpoint has been successfully initialized on server start up, we can proceed with testing our `bahmni` endpoint by following the below steps.

We will be using a basic `curl` command to send our request to the mapping mediator but any other client could be used to achieve the same result.

#### Step 1

Create a file called [data.json](https://github.com/jembi/openhim-mediator-mapping/tree/master/samples/inputData/bahmniPatient.json) in any directory of your choosing. This file will contain the payload data we will be sending as part of our request

<ExternalContentSyntaxHighlighter
  url="https://github.com/jembi/openhim-mediator-mapping/tree/master/samples/inputData/bahmniPatient.json"
  language="json"
/>

#### Step 2

execute the below command to send the curl request to your mapping mediator instance

```curl
curl -X POST -H "Content-Type: application/json" -H "Content-Length: 0" -d @data.json http://localhost:3003/bahmni
```

## Outcome

Once the request has been successfully triggered and processed by the mapping mediator you should be getting a `200` response code back as well as the below response data.

```json
{
  "some": "sample JSON"
}
```
