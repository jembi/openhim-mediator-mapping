# Openhim Mediator Mapping

[![Build Status](https://travis-ci.com/jembi/openhim-mediator-mapping.svg?branch=master)](https://travis-ci.org/jembi/openhim-mediator-mapping)
[![codecov](https://codecov.io/gh/jembi/openhim-mediator-mapping/branch/master/graph/badge.svg)](https://codecov.io/gh/jembi/openhim-mediator-mapping)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/jembi/openhim-mediator-mapping.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jembi/openhim-mediator-mapping/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/jembi/openhim-mediator-mapping.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jembi/openhim-mediator-mapping/context:javascript)

This Mapping mediator is a POC. It's function is to allow data validation, and mapping to allow communication between previously disparate systems. What makes it different from other existing mapping mediators is that it is generic. Users can define their own validation and mapping schemas for their specific use case. This is useful as it opens up Mapping Mediators to users without any coding knowledge.

Please see our [docs](https://jembi.github.io/openhim-mediator-mapping/docs/setup) for setup more details.

## Prerequisite

To store endpoint data:

- MongoDB >= 3.6 as we need dotted key support (e.g. `{ 'key.path': 'xyz' }`)
- Your MongoDB set up needs to be a replica set

## Setup Mongo Replica Set

### Yarn Set Up

This set up guide will make use of Docker to run the Mongo cluster and yarn to run the Mapping Mediator. The containers will connect with each other over a Docker Network.

The easiest way to setup the mongo containers is to use a `docker-compose` script. One is provided in the repo (`docker-compose.mongo.yml`)

Run the script with the following command:

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

With your replica set running, you can start up your Mapping Mediator. First install the Node dependencies by running `yarn`. Then include the following environment variable configs to connect your Mapping Mediator to the MongoDB replica set:

- MONGO_URL='mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set'
- OPENHIM_REGISTER=false

```sh
MONGO_URL='mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set' OPENHIM_REGISTER=false yarn start
```

Your mapper output logs should include the following:

```txt
Server listening on port 3003...
Connected to mongo on mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set
MongoDB Change Event Listeners Added
```

### Docker Set Up

This set up guide will make use of Docker to run the Mongo cluster and the Mapping Mediator. The containers will connect with each other over a Docker Network.

The easiest way to setup the mongo containers is to use a `docker-compose` script. One is provided in the repo (`docker-compose.mongo.yml`)

Run the script with the following command:

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

> Note: The Mongo replica set config between the **docker and yarn setup instructions are not interchangable**.

With your replica set running, you can start up your Mapping Mediator with the following command:

```sh
docker run -it -p 3003:3003 -e OPENHIM_REGISTER=false -e MONGO_URL='mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo:27017/mapping-mediator?replicaSet=mapper-mongo-set' --network {directory-name}_mapper-cluster-network jembi/openhim-mapping-mediator:latest
```

The following parameters are specific to the docker start up process:

- `-e OPENHIM_REGISTER=false`

  > This environment variable allows the Mapping Mediator to be **started up without the OpenHIM**. See the next section to start up the Mapper with the OpenHIM.

- `-e MONGO_URL='mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set'`

  The Mongo URL lists all members of the replica set as well as the name of the replica set

- `--network mapper-cluster-network`

  The Mapping Mediator Container needs to connect to the same Docker network on which the Mongo replica set communicates

## Registering with the OpenHIM

The mapping mediator, like most other OpenHIM mediators, can register to an instance of the OpenHIM. This gives the user a graphical interface to interact with the mediator for status information and config options(if available).

> Note: For multiple instances of the mediator to register to the same instance of the openHIM each mediator has to have a unique `urn`. You can set the `urn` using the environment variable MEDIATOR_URN.

To get an OpenHIM Core and Console instance setup, use the `docker-compose.openhim.yml` script here (or your preferred method). Run the docker compose command with the following:

```sh
docker-compose -f docker-compose.openhim.yml up -d
```

Open a browser and navigate to <http://localhost:9000>. Login with the default username **root@openhim.org** and password **openhim-password** then by-pass the security warnings. For more information on how to do this see [our OpenHIM set up tutorial](https://youtu.be/F0bTS3qJlG0?t=173). Finally, set your new openhim root user password.

### Yarn Set Up

To register the mediator, you will need the following environment variables:

- OPENHIM_URL=https://localhost:8080
- OPENHIM_PASSWORD={openhim_password}

Substitute in your openhim password into the following command:

```sh
OPENHIM_URL=https://localhost:8080 OPENHIM_PASSWORD={openhim_password} yarn start
```

The output logs should contain the message: **Successfully registered mediator!**

Finally, go back to your browser and navigate to the `Mediators` section. Here you should see your mapping mediator instance registered on the OpenHIM with a recent *heartbeat*

### Docker Set Up

To register as a mediator, you will need the following environment variables:

- OPENHIM_URL=https://openhim-core:8080
- OPENHIM_PASSWORD={openhim_password}
- MONGO_URL=mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set

```sh
docker run -e OPENHIM_URL=https://openhim-core:8080 -e OPENHIM_PASSWORD={openhim_password} -e MONGO_URL=mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set --network mapper-cluster-network --name mapper -d jembi/openhim-mediator-mapping:v2.2.0
```

To see the output logs of the mapping mediator run the following command:

```sh
docker logs -f mapper
```

Here you should see the message: **Successfully registered mediator!**

Finally, go back to your browser and navigate to the `Mediators` section. Here you should see your mapping mediator instance registered on the OpenHIM with a recent *heartbeat*.
