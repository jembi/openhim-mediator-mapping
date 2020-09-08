---
id: setup
title: Setup
sidebar_label: Setup
---

The OpenHIM Mediator Mapping can be setup within a [NodeJS](https://nodejs.org/en/) environment along with [NPM](https://www.npmjs.com/) or with [Docker](https://docs.docker.com/). In either case it is configured using environment variables.

This application was developed using [Erbium](https://nodejs.org/en/about/releases/) NodeJS and is supporting the last two LTS versions of NodeJS

## NodeJS and NPM

### Get code from Github

To get the OpenHIM Mediator Mapping code from the Github execute any of the below commands to get the codebase

#### Cloned repository

```sh
git clone https://github.com/jembi/openhim-mediator-mapping.git
```

#### Zipped repository

```sh
wget https://github.com/jembi/openhim-mediator-mapping/archive/master.zip
```

#### Zipped release version

A tagged release can be downloaded by executing the below command, and replacing the <RELEASE_VERSION> placeholder with an actual [release tag](https://github.com/jembi/openhim-mediator-mapping/releases): E.g `v1.0.0`

```sh
wget https://github.com/jembi/openhim-mediator-mapping/releases/download/<RELEASE_VERSION>/build.openhim-mediator-mapping.<RELEASE_VERSION>.zip
```

### Run the code

To start up the application, navigate into the root directory of the application within your terminal and execute the following commands:

  > **NB! Zipped Release Version** - You do NOT have to run the `npm install` command as this has already been done in the release version. After downloading the specific release build, you can start the application by executing the `npm start` command

Install all the required dependencies

```sh
npm install
```

Start the application (optionally supplying any required [environment variables](setup.md#environment-variables))

```sh
<ENVIRONMENT_VARIABLES> npm start
```

---

## Docker

The OpenHIM Mediator Mapping has been made available as a Docker container and can either be pulled from the Dockerhub repository, or it can be built locally

### Dockerhub

Pull the image from the publicly available repository by executing the below command

```sh
docker run -p 3003:3003 --name mapper jembi/openhim-mediator-mapping:latest
```

### Local build

Build the image from the application directory by executing the below commands:

Build the image based of off the `Dockerfile` within the root directory

```sh
docker build -t openhim-mediator-mapping .
```

Create the container from the image that was built in the previous step

```sh
docker run -p 3003:3003 --name mapper openhim-mediator-mapping
```

[Environment variables](setup.md#environment-variables) can be included using the `-e` flag. For example:

```sh
docker run -p 3003:3003 --name mapper -e TRUST_SELF_SIGNED=true openhim-mediator-mapping
```

---

## Environment Variables

The supported environment variables are listed as follows:

- SERVER_PORT - Default: **3003**

  > The server port to start the application on

- LOG_LEVEL - Default: **info**

  > The log level at which the logs should be printed out

- ENABLE_LOGGING - Default: **true**

  > Define if the application should print out any logs

- MONGO_URL - Default: **mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set**

  > The MongoDB url for connecting to the replica set database

- OPENHIM_URL - Default: <https://localhost:8080>

  > The URL to the OpenHIM instance<br />
  If running the OpenHIM in a docker container substitute in the **container name** instead of **localhost**.

- OPENHIM_USERNAME - Default: **root@openhim.org**

  > The OpenHIM user to authenticate with

- OPENHIM_PASSWORD - Default: **openhim-password**

  > The OpenHIM password for the supplied user to authenticate with

- TRUST_SELF_SIGNED - Default: **true**

  > Bypass the nodejs ssl certificate check on self signed certificates<br />
  Only set this variable to `true` if you are using it in a non-production environment

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

- VALIDATION_ACCEPT_NULL_VALUES - Default: **false**

  > This is used to configure the validation middleware to accept `null` values

- VALIDATION_COERCE_TYPES - Default: **false**

  > Allow the validation middleware to coerce the incoming data values into the defined validation type. If the property validation type is defined as `number` and the value being supplied is a `string`, then the validation middleware will format the value into a `number`

<<<<<<< HEAD
- DYNAMIC_ENDPOINTS - Default: **true**

  > Define wether MongoDB should create a listener on the Endpoints collection to automatically apply endpoint changes
=======
- MEDIATOR_URN - Default: **urn:mediator:generic_mapper**
  
  > Set a unique identifier to allow for multiple `openhim-mediator-mapping` instances to be registered to the OpenHIM.
>>>>>>> fe9f45b50712ea35d4913fd6223d0426179c70f7
