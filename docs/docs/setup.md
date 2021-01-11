---
id: setup
title: Setup
sidebar_label: Setup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Mapping mediator can be setup within a [NodeJS](https://nodejs.org/en/) environment using [Yarn](https://yarnpkg.com/) or with [Docker](https://docs.docker.com/). In either case, it depends on MongoDB setup as a replica set. The mediator is configured using environment variables.
Setting up the OpenHIM (Core and Console) is recommended but not required.

> This guide is aimed at Linux users.

## Prerequisites

To store endpoint data:

- [MongoDB](https://docs.mongodb.com/manual/) >= 3.6 as we need dotted key support (e.g. `{ 'key.path': 'xyz' }`)
- Your MongoDB set up needs to be a [replica set](https://docs.mongodb.com/manual/replication/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Get code from Github

To get the OpenHIM Mediator Mapping code from GitHub, execute any of the below commands to get the codebase

Cloned repository:

```sh
git clone https://github.com/jembi/openhim-mediator-mapping.git
```

Zipped repository:

```sh
wget https://github.com/jembi/openhim-mediator-mapping/archive/master.zip
```

Zipped release version. Tagged releases can be downloaded by executing the below command, and replacing the <RELEASE_VERSION> placeholder with an actual [release tag](https://github.com/jembi/openhim-mediator-mapping/releases): E.g `v2.2.0`

```sh
wget https://github.com/jembi/openhim-mediator-mapping/releases/download/<RELEASE_VERSION>/build.openhim-mediator-mapping.<RELEASE_VERSION>.zip
```

<Tabs
  defaultValue="docker"
  values={
    [
      { label: 'Docker Mapper Setup', value: 'docker' },
      { label: 'Yarn Mapper Setup', value: 'yarn' },
    ]
  }>
  <TabItem value="docker">

## Setup Mongo Replica Set for Docker Env

> Note: The Mongo replica set config between the **docker and yarn setup instructions are NOT interchangeable**.

This set up guide will make use of **Docker to run the Mongo cluster and the Mapping Mediator**. The containers will connect with each other over a `Docker Network`.

The easiest way to setup the mongo containers is to use a `docker-compose` script. One is provided in the repo (`docker-compose.mongo.yml`)

Run the script from the project root directory with the following command:

```sh
docker-compose -f docker-compose.mongo.yml up -d
```

Once the containers have started up exec into one of the containers with the following command, `docker exec -it mapper-mongo-1 mongo`

Inside the shell enter the following:

```sh
config = {
  "_id": "mapper-mongo-set",
  "members": [
    {
      "_id": 0,
      "priority": 1,
      "host": "mapper-mongo-1:27017"
    },
    {
      "_id": 1,
      "priority": 0.5,
      "host": "mapper-mongo-2:27017"
    },
    {
      "_id": 2,
      "priority": 0.5,
      "host": "mapper-mongo-3:27017"
    }
  ]
}

rs.initiate(config)
```

## Registering with the OpenHIM

The mapping mediator, like most other OpenHIM mediators, can register to an instance of the OpenHIM. This gives the user a graphical interface to interact with the mediator for status information and config options(if available).

> Note: For multiple instances of the mediator to register to the same instance of the OpenHIM each mediator has to have a unique `urn`. You can set the `urn` using the environment variable MEDIATOR_URN.

To get an OpenHIM Core and Console instance setup, use the `docker-compose.openhim.yml` script here (or your preferred method). Run the docker compose command with the following:

```sh
docker-compose -f docker-compose.openhim.yml up -d
```

Open a browser and navigate to <http://localhost:9000>. Login with the default username **root@openhim.org** and password **openhim-password** then by-pass the security warnings. For more information on how to do this see [our OpenHIM set up tutorial](https://youtu.be/F0bTS3qJlG0?t=173). Finally, set your new openhim root user password.

### Docker Mediator Start Up

To register as a mediator, you will need the following environment variables:

- `OPENHIM_URL=https://openhim-core:8080`
- `OPENHIM_PASSWORD={openhim_password}`
- `MONGO_URL=mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set`

```sh
docker run -e OPENHIM_URL=https://openhim-core:8080 -e OPENHIM_PASSWORD={openhim_password} -e MONGO_URL=mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set --network mapper-cluster-network --name mapper -d jembi/openhim-mediator-mapping:latest
```

> Note: **The Mapping Mediator is not exposed to your local machine in this case**. All requests would need to go through the OpenHIM. To expose the Mapping Mediator port to your local machine include the following flag in your run command: `-p 3003:3003`

To see the output logs of the mapping mediator run the following command:

```sh
docker logs -f mapper
```

Here you should see the message: **Successfully registered mediator!**

Finally, go back to your browser and navigate to the `Mediators` section. Here you should see your mapping mediator instance registered on the OpenHIM with a recent *heartbeat*.

  </TabItem>

  <TabItem value="yarn">

## Setup Mongo Replica Set for Yarn Env

> Note: The Mongo replica set config between the **docker and yarn setup instructions are NOT interchangeable**.

This set up guide will make use of **Docker to run the MongoDB cluster** and **Yarn to run the Mapping Mediator**. The MongoDB containers will connect with each other over a `Docker Network`. The Mapping Mediator will connect to the MongoDB Cluster via the `host network`.

The easiest way to setup the mongo containers is to use a `docker-compose` script. One is provided in the repo (`docker-compose.mongo.yml`)

Run the script from the project root directory with the following command:

```sh
docker-compose -f docker-compose.mongo.yml up -d
```

Next, setup the replica set. Once the containers have started up exec into one of the containers with the following command, `docker exec -it mapper-mongo-1 mongo`

Inside the shell enter the following:

```sh
config = {
  "_id": "mapper-mongo-set",
  "members": [
    {
      "_id": 0,
      "priority": 1,
      "host": "172.17.0.1:27017"
    },
    {
      "_id": 1,
      "priority": 0.5,
      "host": "172.17.0.1:27018"
    },
    {
      "_id": 2,
      "priority": 0.5,
      "host": "172.17.0.1:27019"
    }
  ]
}

rs.initiate(config)
```

> **NOTE:** The IP used here is the local docker bridge IP. This IP is generally consistent, however different docker configurations could result in differences. You can confirm your IP with this terminal command: `ifconfig docker0`

## Registering with the OpenHIM

The mapping mediator, like most other OpenHIM mediators, can register to an instance of the OpenHIM. This gives the user a graphical interface to interact with the mediator for status information and config options(if available).

> Note: For multiple instances of the mediator to register to the same instance of the OpenHIM each mediator has to have a unique `urn`. You can set the `urn` using the environment variable MEDIATOR_URN.

To get an OpenHIM Core and Console instance setup, use the `docker-compose.openhim.yml` script here (or your preferred method). Run the docker compose command with the following:

```sh
docker-compose -f docker-compose.openhim.yml up -d
```

Open a browser and navigate to <http://localhost:9000>. Login with the default username **root@openhim.org** and password **openhim-password** then by-pass the security warnings. For more information on how to do this see [our OpenHIM set up tutorial](https://youtu.be/F0bTS3qJlG0?t=173). Finally, set your new openhim root user password.

## Yarn Mediator Start Up

From the project root run the following to install all the required dependencies:

```sh
yarn
```

  > **NB! Zipped Release Version** - You do NOT have to run the `yarn` command as this has already been done in the release version. After downloading the specific release build, you can start the application by executing the `yarn start` command

To register the mediator, you will need the following environment variables:

- `MONGO_URL='mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set'`
- `OPENHIM_URL=https://localhost:8080`
- `OPENHIM_PASSWORD={openhim_password}`

Substitute in your openhim password into the following command:

```sh
MONGO_URL='mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set' OPENHIM_URL=https://localhost:8080 OPENHIM_PASSWORD={openhim_password} yarn start
```

Your mapper output logs should include the following:

```txt
Server listening on port 3003...
Connected to mongo on mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set
MongoDB Change Event Listeners Added
```

Finally, go back to your browser and navigate to the `Mediators` section. Here you should see your mapping mediator instance registered on the OpenHIM with a recent *heartbeat*

  </TabItem>
</Tabs>

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

- ENABLE_LOGGING - Default: **true**

  > Output logs

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

- DYNAMIC_ENDPOINTS - Default: **true**

  > Define wether MongoDB should create a listener on the Endpoints collection to automatically apply endpoint changes

- MEDIATOR_URN - Default: **urn:mediator:generic_mapper**

  > Set a unique identifier to allow for multiple `openhim-mediator-mapping` instances to be registered to the OpenHIM.
