# Mapping Mediator Setup

**This project is a proof of concept and not recommended as Production ready code!**

The Mapping mediator can be setup within a NodeJS environment along with NPM or with Docker. In either case it is configured using environment variables.

## Environment Variables

The supported environment variables are listed as follows:

* SERVER_PORT - Default: **3003**

* LOG_LEVEL - Default: **info**

* OPENHIM_URL - Default: <http://localhost:8080>

  > If running the OpenHIM in a docker container substitute in the `container name` instead of localhost.

* OPENHIM_USERNAME - Default: **root@openhim.org**

* OPENHIM_PASSWORD - Default: **openhim-password**

  >The OpenHIM requires this default API password to be changed on first login.

* TRUST_SELF_SIGNED - Default: **false**

  > Only set this variable to `true` if you are using it in a non-production environment

## Configuration files

The configuration files must be stored in a directory in the root of the project named endpoints. Within this endpoints directory should be further broken down into sub-directories each containing a minimum of three specific files: `meta.json`, `input-mapping.json`, and `input-validation.json`. `output.json` is optional a this point. The endpoints directory should be in the following structure:

```txt
├── Endpoints
    ├── Example Patient Mapping
        ├── meta.json
        ├── input-validation.json
        ├── input-mapping.json
        ├── output.json (optional)
    ├── Example Observation Mapping
        ├── meta.json
        ├── input-validation.json
        ├── input-mapping.json
        ├── output.json (optional)
    ├── Example Different Patient Mapping
        ├── meta.json
        ├── input-validation.json
        ├── input-mapping.json
        ├── output.json (optional)
```

### Meta Data

The `meta.json` file contains the details involved in route setup. The following can be set in the `meta.json` file:

* Mapping route path
* Expected **input** message type
* Desired **output** message type

#### Mapping Route Path

This is the path on which the OpenHIM Mapping Mediator will listen to trigger a specific message mapping transformation.

#### Expected Input

In future, this Mapping Mediator will be able to accept any standardized message type (ie: `JSON`, `XML`, and`Turtle`) then convert it into JSON to be validated and mapped by our core engine. Initially we will only support `JSON`

#### Desired Output

In future this Mapping Mediator will be able to transform our transformed JSON output into any standardized message type (ie: `JSON`, `XML`, and `Turtle`) before returning the response to the client. Initially we will only support `JSON`

### Input Validation Schema

### Input Mapping Schema

## NodeJS and NPM

This project was developed using Dubnium NodeJS.

To start up the project navigate into the root of the project in a terminal and run the following:

```sh
npm install
<Environment Variables> npm start
```

Once the mediator has successfully started up you can test it by sending a POST request directly to your configured endpoints on the mediator.

```bash
curl --request POST --header "Content-Type: application/json" --data '{"key1":"value1", "key2":"value2"}' http://localhost:3003/<path_configured_in_meta.json>
```

Or you could setup channels on your OpenHIM instance corresponding to your endpoints and send requests through to the OpenHIM to track the transaction there.

## Docker

> To run in docker

From the project directory run:

```sh
docker build -t mapper .

docker run --network {network-name} -v /endpoints:/endpoints -p 3003:3003 --name mapper mapper
```

The network flag is optional. If connecting to a specific docker network find the network name by running:

```sh
docker network ls
```

Environmental variables can be included using the `-e` flag. For example:

```sh
docker run --network {network-name} -p 3003:3003 --name mapper -e TRUST_SELF_SIGNED=true mapper
```

If a new endpoint is added to the endpoints folder, the docker container will have to be restarted:

```sh
docker restart mapper
```
