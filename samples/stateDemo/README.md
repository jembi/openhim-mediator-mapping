# State Demo

This sample endpoint accepts a tiny payload containing a statusCode value. This is the value returned by an online test api. It is useful for checking how we can manipulate "valid" state with http status code and network filters.
The endpoint also maps a few state captured values to demonstrate how one would go about accessing them.

## Features

- State - Set state filter options to exclude network errors and errored http status codes. THe state will also save two values from the lookup requests values - these can then be used by the next endpoint request.
- Transformation - Checks the state system field exists and a ternary is triggered based on that
- Mapping - Very basic flat mapping. Retrieves a variety of data from the state, transforms, timestamps, requestBody, and lookupRequests.
- Request - The lookup requests gather the required data from httpbin. The first lookup triggers a specified http status code reponse from httpbin. The second one get a random uuid returned.
- Constants - Contains the static value required for constructing a status response

## Setup

To create this endpoint within the Mapping Mediator, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d "@endpoint.json" -H "Content-Type: application/json" http://localhost:3003/endpoints
```

## Test

To test the endpoint configured successfully, execute the below curl command from the location of this sample endpoint.

```sh
curl -X POST -d '{"statusCode": 404}' -H "Content-Type: application/json" http://localhost:3003/state-demo
```

With this command you will see in the `state-status` field that `"No state captured yet || No captured state available that matches status and network filters"`. Run that same command and the `state-status` should remain the same. This is because the endpoint is configured to only return past state values that meet lookup request status code filters - in this example the only valid status code are in the 2xx range the code 300. Since we've been sending through 404s the state is captured but not returned.

Test the endpoint again with the following command:

```sh
curl -X POST -d '{"statusCode": 201}' -H "Content-Type: application/json" http://localhost:3003/state-demo
```

Then run the following:

```sh
curl -X POST -d '{"statusCode": 300}' -H "Content-Type: application/json" http://localhost:3003/state-demo
```

The output should be:

```json
{
  "state-status":"Valid state returned",
  "http-status-requestId1-state":201,
  "http-status-requestId1-current":300,
  "start-time-requestId1-state":"2021-01-21T10:03:38.706Z",
  "start-time-requestId1-current":"2021-01-21T10:03:50.034Z",
  "uuid-requestId2-state":"7fda4358-895d-4d1c-a091-562c4ee0dee9",
  "uuid-requestId2-current":"f717a849-31eb-4d71-81f1-29d3251f57ff"
}
```

This response shows that the previous payload constaining `{"statusCode": 201}` was stored and returned from the endpoint state. Keep playing around with statusCodes inside and outside of the valid range.

> Note: status codes in the 1xx range behave strangely here - if you need functionality relating to the 1xx range please log an issue on our [GitHub page](https://github.com/jembi/openhim-mediator-mapping/issues). The functionality has not been included as 1xx range status codes are common.
