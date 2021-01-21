---
id: samples
title: Sample Endpoint Schemas
sidebar_label: Sample Endpoint Schemas
---

import useBaseUrl from '@docusaurus/useBaseUrl';

Within the Mapping Mediator repository we have created a set of sample Endpoint Schemas to help new users test out some of the Mapping Mediators features.

## Pre-requisites

To use these sample schemas, you require an instance of the Mapping Mediator running, internet access and [Postman](https://www.postman.com/features/mock-api/) installed on your local Linux machine.

> Note: Start up your Mapping Mediator instance with the flag `VALIDATION_ACCEPT_NULL_VALUES=true` to support the BAHMNI test data.

If you experience any issues with our sample Endpoints, please log an issue on our [GitHub page](https://github.com/jembi/openhim-mediator-mapping/issues).

## Import Postman Collection

In your Postman desktop application, click the import button in the top left of the screen. Then click the link tab and paste in the following collection URL: <https://www.getpostman.com/collections/93d96917e29ee55f56c9>

## Test out Samples

The samples cover many of the Mapping Mediator features in common use cases.

<img alt="Postman Samples" src={useBaseUrl('img/postman-samples.png')} />

All the scenarios will interact with online sandbox services. i.e DHIS2 and HAPI FHIR
### Basic Mapping

In this example, a simple flat JSON object containing some patient data is mapped into an output FHIR Patient format.

Features Covered:

- Basic Mapping

### FHIR Observations Height Weight

The purpose of this example is to demonstrate transformations and response request orchestration.
In the example we map incoming patient data into a FHIR Bundle containing multiple observations.
The constants section in the Endpoint Schema is used to define static metadata of the output structure.

Features Covered:

- Validation
- **Transformation**
- Mapping
- **Response Orchestration**

### BAHMNI Patient to FHIR

This is part of a real use case where the BAHMNI Patient data needs to be sent to a FHIR server.
The example demonstrates more complex mapping and validation situations.

> Make sure your mapping mediator was started with this flag `VALIDATION_ACCEPT_NULL_VALUES=true` (yarn) or `-e VALIDATION_ACCEPT_NULL_VALUES=true` (docker)

Features Covered:

- **Validation**
- **Mapping**

### Requests DHIS2

This example makes three lookup requests to DHIS2.
The data from these lookups could have been done in one request but the purpose of this example is to demonstrate aggregating multiple input sources.
Here we also cover chained endpoint calls.
The first endpoint deals with getting data from multiple lookup requests and aggregating it.
The second endpoint validates and maps the data into a FHIR Bundle of Location resources.

Features Covered:

- **Lookup Orchestration**
- Validation
- Mapping
- **Chained (internal) Endpoint Orchestration**
- Response Orchestration

### State Demo

This example makes two requests to the httpbin API. This API provides configurable mock responses to the client. The first lookup request makes a get request and configures a specific expected https staus code. The second lookup request gets a random uuid.
These values are then extracted and stored to the Endpoint state. The values are available the next endpoint request. The endpoint state can be configured to only return state data that has desired httpStatus codes. Or data from transactions that didn't experience network issues. The endpoint state default is no filters.

To test out how state works, run the `payload` request a few times with different request body values. Try the following values in succession 201, 404, 400, 300, 201.

Features Covered:

- **State**
- Lookup Orchestration
- Transformation
- **Mapping**
