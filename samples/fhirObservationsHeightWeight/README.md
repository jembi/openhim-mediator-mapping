# FHIR - Create Observations (weight/height)

This sample endpoint accepts a basic flat object and converts it into a FHIR transaction bundle for saving two Observations for a Patient UUID

## Features

- Validation - Ensure that the incoming payload contains the required fields we need, and that they are in the correct format as specified in the input validation
- Mapping - Create a new FHIR transaction bundle object from the supplied request payload, and from the configured constants, input transforms, endpoint state
- Constants - Contains all the static values required for constructing the FHIR transaction bundle
- States - Extract the endpoint start time to populate the effectiveDate of the Observation (When the observation was created)
- Input Transforms
  - To build a new string for the Patient reference property - This requires the text "Patient/" to be prefixed on the supplied Patient UUID
  - To convert the supplied height value from meters to centimeters

## Setup

To create this endpoint within the Mapping Mediator, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@endpoint.json" -H "Content-Type: application/json" http://localhost:3003/endpoints
```

## Test

To test the endpoint configured successfully, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@payload.json" -H "Content-Type: application/json" http://localhost:3003/create-height-weight-observations
```
