# DHIS2 Facility data to FHIR Bundle

This sample endpoint requests DHIS2 facility data sets and converts it into a [FHIR Bundle](https://www.hl7.org/fhir/bundle.html) containing [FHIR Organizations](https://www.hl7.org/fhir/organization.html)

## Features

- Validation - Ensure that the incoming lookup request data contains the required fields, and that they are in the correct format
- Requests - The requests here orchestrate data for this transaction. The lookup requests gather the required data. The response request send that finalised output data to a FHIR server
- Mapping - Create a new FHIR Bundle from the configured lookup requests and constants
- Constants - Contains all the static values required for constructing the FHIR Patient Resource

## Setup

To create these endpoints within the Mapping Mediator, execute the below curl commands from the location of this sample.

```sh
curl -X POST -d "@endpointPart1.json" -H "Content-Type: application/json" http://localhost:3003/endpoints

curl -X POST -d "@endpointPart2.json" -H "Content-Type: application/json" http://localhost:3003/endpoints
```

## Test

To test the endpoints configured successfully, execute the below curl command from the location of this sample. (It may take a while to complete)

```sh
curl -X GET -H "Content-Type: application/json" http://localhost:3003/dhis2
```
