---
id: samples
title: Sample Endpoint Schemas
sidebar_label: Sample Endpoint Schemas
---

import useBaseUrl from '@docusaurus/useBaseUrl';

Within the Mapping Mediator repository we have created a set of sample Endpoint Schemas to help new users test out some of the Mapping Mediators features.

## Pre-requisites

To use these sample schemas, you require an instance of the Mapping Mediator running, internet access and [Postman](https://www.postman.com/features/mock-api/) installed on your local Linux machine.

## Import Postman Collection

In your Postman desktop application, click the import button in the top left of the screen. Then click the link tab and paste in the following collection URL: <https://www.getpostman.com/collections/93d96917e29ee55f56c9>

## Test out Samples

The samples cover many of the Mapping Mediator features in common use cases.

<img alt="Postman Samples" src={useBaseUrl('img/postman-samples.png')} />

### Basic Mapping

Features Covered:

- Basic Mapping

### FHIR Observations Height Weight

Features Covered:

- Validation
- **Transformation**
- Mapping
- **Response Orchestration**

### BAHMNI Patient to FHIR

Features Covered:

- **Validation**
- **Mapping**

### Requests DHIS2

Features Covered:

- **Lookup Orchestration**
- Validation
- Mapping
- **Chained (internal) Endpoint Orchestration**
- Response Orchestration
