# BAHMNI Patient to FHIR Patient

This sample endpoint accepts a BAHMNI patient object and converts it into a [FHIR Patient resource](https://www.hl7.org/fhir/patient.html)

## Features

- Validation - Ensure that the incoming payload contains the required fields we need, and that they are in the correct format as specified in the input validation
- Mapping - Create a new FHIR Patient object from the supplied request payload and the configured constant
- Constants - Contains the static value required for constructing the FHIR Patient Resource

## Setup

To create this endpoint within the Mapping Mediator, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@endpoint.json" -H "Content-Type: application/json" http://localhost:3003/endpoints
```

## Test

To test the endpoint configured successfully, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@input.json" -H "Content-Type: application/json" http://localhost:3003/bahmniPatient
```
