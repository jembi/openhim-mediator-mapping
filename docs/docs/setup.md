---
id: setup
title: Setup
sidebar_label: Setup
---

**This project is a proof of concept and not recommended as Production ready code!**

The Mapping mediator can be setup within a [NodeJS](https://nodejs.org/en/) environment along with [NPM](https://www.npmjs.com/) or with [Docker](https://docs.docker.com/). In either case it is configured using environment variables.


## NodeJS and NPM

This project was developed using [Dubnium](https://scotch.io/tutorials/whats-new-in-node-10-dubnium) NodeJS.

To start up the project navigate into the root of the project in a terminal and run the following:

```sh
npm install

<Environment_Variables> npm start
```

Once the mediator has successfully started up you can test it by sending a POST request directly to your configured endpoints on the mediator.

```bash
curl --request POST --header "Content-Type: application/json" --data '{"key1":"value1", "key2":"value2"}' http://localhost:3003/<path_configured_in_meta.json>
```

Or you could setup channels on your OpenHIM instance corresponding to your endpoints and send requests through to the OpenHIM to track the transaction there. See [here](https://github.com/jembi/openhim-mediator-tutorial/blob/master/0_Starting_OpenHIM.md#step-5---testing-the-openhim-routing) for a quick OpenHIM tutorial.

---

## Docker

From the project directory run:

```sh
docker build -t mapper .

docker run --network {network-name} -v /endpoints:/endpoints -p 3003:3003 --name mapper mapper
```

The network flag is optional. If connecting to a specific docker network find the network name by running:

```sh
docker network ls
```

**Environmental variables** can be included using the `-e` flag. For example:

```sh
docker run --network {network-name} -p 3003:3003 --name mapper -e TRUST_SELF_SIGNED=true mapper
```

If a new endpoint is added to the endpoints folder, the docker container will have to be restarted:

```sh
docker restart mapper
```

---

## Environment Variables

The supported environment variables are listed as follows:

- SERVER_PORT - Default: **3003**

- LOG_LEVEL - Default: **info**

- OPENHIM_URL - Default: <https://localhost:8080>

  > If running the OpenHIM in a docker container substitute in the **container name** instead of **localhost**.

- OPENHIM_USERNAME - Default: **root@openhim.org**

- OPENHIM_PASSWORD - Default: **openhim-password**

  > The OpenHIM requires this default API password to be changed on first login.

- TRUST_SELF_SIGNED - Default: **false**

  > Only set this variable to `true` if you are using it in a non-production environment

- OPENHIM_REGISTER - Default: **true**

  > Set to **false** if you do not wish to have this mediator register itself with the openhim instance

- PARSER_LIMIT - Default: **1mb**

  > Define the incoming body limit size. If the incoming body is bigger than the specified limit, the validation will fail

- PARSER_XML_OPTIONS_TRIM - Default: **true**

  > Trim the whitespace at the beginning and end of text nodes

- PARSER_XML_OPTIONS_EXPLICIT_ROOT - Default: **false**

  > Set this if you want to get the root node in the resulting object

- PARSER_XML_OPTIONS_EXPLICIT_ARRAY - Default: **false**

  > Always put child nodes in an array if true; otherwise an array is created only if there is more than one

- VALIDATION_ACCEPT_NULL_VALUES - Default: **true**

  > This is used to configure the validation middleware to accept `null` values

- VALIDATION_COERCE_TYPES - Default: **false**

  > Allow the validation middleware to coerce the incoming data values into the defined validation type. If the property validation type is defined as `number` and the value being supplied is a `string`, then the validation middleware will format the value into a `number`