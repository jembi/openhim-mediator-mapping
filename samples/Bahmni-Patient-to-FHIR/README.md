# Bahmni Patient - Convert to FHIR resource

This sample endpoint accepts a Bahmni Patient in JSON format and converts it into a FHIR Patient resource

## Features

- Validation - Ensure that the incoming payload contains the required fields we need, and that they are in the correct format as specified in the input validation
- Mapping - Create a new FHIR transaction bundle object from the supplied request payload, and from the configured constants, input transforms, endpoint state
- Constants - Contains all the static values required for constructing the FHIR transaction bundle

## Setup

To create this endpoint within the OpenHIM Mediator Mapping, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@endpoint.json" -H "Content-Type: application/json" http://localhost:3003/endpoints
```

## Test

To test the endpoint is configured successfully, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@payload.json" -H "Content-Type: application/json" http://localhost:3003/bahmni-patient-to-fhir
```
