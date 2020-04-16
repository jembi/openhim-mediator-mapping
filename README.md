# Openhim Mediator Mapping

[![Build Status](https://travis-ci.com/jembi/openhim-mediator-mapping.svg?branch=master)](https://travis-ci.org/jembi/openhim-mediator-mapping)
[![codecov](https://codecov.io/gh/jembi/openhim-mediator-mapping/branch/master/graph/badge.svg)](https://codecov.io/gh/jembi/openhim-mediator-mapping)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/jembi/openhim-mediator-mapping.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jembi/openhim-mediator-mapping/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/jembi/openhim-mediator-mapping.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jembi/openhim-mediator-mapping/context:javascript)

This Mapping mediator is a POC. It's function is to allow data validation, and mapping to allow communication between previously disparate systems. What makes it different from other existing mapping mediators is that it is generic. Users can define their own validation and mapping schemas for their specific use case. This is useful as it opens up Mapping Mediators to users without any coding knowledge.

Please see our [docs](./docs/Setup.md) for setup more details.

## Prerequisite

To store endpoint data:

- MongoDB >= 3.6 as we need dotted key support (e.g. `{ 'key.path': 'xyz' }`)
- Your MongoDB set up needs to be a replica set

## Setup Mongo Replica Set

### Yarn Set Up

This set up guide will make use of Docker to run the Mongo cluster and yarn to run the Mapping Mediator. The containers will connect with each other over a Docker Network.

The easiest way to setup the mongo containers is to run these commands in a `docker-compose` script. To do this copy the code below into a file named `docker-compose.yml`

```yaml
version: '3.3'

networks:
  mapper-cluster-network:

services:
  mapper-mongo-1:
    image: mongo:4.2
    container_name: mapper-mongo-1
    post:
      - "27017:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-2:
    image: mongo:4.2
    container_name: mapper-mongo-2
    post:
      - "27018:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-3:
    image: mongo:4.2
    container_name: mapper-mongo-3
    post:
      - "27019:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set
```

Run the script with the following command:

```sh
docker-compose up -d
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

With your replica set running, you can start up your Mapping Mediator. Include the following environment variable config to connect your Mapping Mediator to the MongoDB replica set:

- MONGO_URL='mongodb://localhost:27017,localhost:27018,localhost:27019/mapping-mediator?replicaSet=mapper-mongo-set'

### Docker Set Up

This set up guide will make use of Docker to run the Mongo cluster and the Mapping Mediator. The containers will connect with each other over a Docker Network.

The easiest way to setup the mongo containers is to run these commands in a `docker-compose` script. To do this copy the code below into a file named `docker-compose.yml`

```yaml
version: '3.3'

networks:
  mapper-cluster-network:

services:
  mapper-mongo-1:
    image: mongo:4.2
    container_name: mapper-mongo-1
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-2:
    image: mongo:4.2
    container_name: mapper-mongo-2
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-3:
    image: mongo:4.2
    container_name: mapper-mongo-3
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set
```

Run the script with the following command:

```sh
docker-compose up -d
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

Next step is to get the name of the Docker network that your cluster communicates on. We defined part of that name in the `docker-compose` script but the network name is prefixed by the name of the directory that contains your script. List the Docker networks to find the network named `{directory-name}_mapper-cluster-network` with the following command:

```sh
docker network ls
```

With your replica set running you can start up your Mapping Mediator with the following command (substitute in your Docker network name at the network flag):

```sh
docker run -it -p 3003:3003 -e MONGO_URL='mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo:27017/mapping-mediator?replicaSet=mapper-mongo-set' --network {directory-name}_mapper-cluster-network jembi/openhim-mapping-mediator:latest
```

The following parameters relate to the Mongo Replica set:

- `-e MONGO_URL='mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set'`

  The Mongo URL lists all members of the replica set as well as the name of the replica set

- `--network mapper-cluster-network`

  The Mapping Mediator Container needs to connect to the same Docker network on which the Mongo replica set communicates
