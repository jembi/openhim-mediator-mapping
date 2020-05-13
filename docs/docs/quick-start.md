---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

This quick start guide should get you up and running in just a few minutes. 

## Prerequisite

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup

Create a new file called `docker-compose.yaml` and save the below commands to the file

### MongoDB replica set

We will first be installing all the mongodb databases for our required replica set

```yaml
version: '3.4'

networks:
  mapper-cluster-network:

services:
  mapper-mongo-1:
    image: mongo:4.2
    container_name: mapper-mongo-1
    ports:
      - "27017:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-2:
    image: mongo:4.2
    container_name: mapper-mongo-2
    ports:
      - "27018:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set

  mapper-mongo-3:
    image: mongo:4.2
    container_name: mapper-mongo-3
    ports:
      - "27019:27017"
    networks:
      - mapper-cluster-network
    command:
      - --replSet
      - mapper-mongo-set
```

Run the docker compose script by executing the below command

```sh
docker-compose up -d
```

The docker images will be downloaded and the containers will be created.

You can see the running docker containers by executing the below command

```sh
docker ps
```

Now we need to configure our mongodb to be a replica set. First we need to get inside of the docker container by executing the below

```sh
docker exec -it mapper-mongo-1 mongo
```

Now we can configure our replica set be executing the below command 

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

You can `exit` the docker container and you mongodb replica set should be successfully configured

### Mapper

we can add the `mapper` service to our `docker-compose.yaml` file

The `mapper` service would fail to start up properly if the mongodb replica set wasn't configured properly

```yaml
mapper:
  container_name: mapper
  image: jembi/openhim-mediator-mapping:latest
  environment:
    - MONGO_URL='mongodb://mapper-mongo-1:27017,mapper-mongo-2:27018,mapper-mongo-3:27019/mapping-mediator?replicaSet=mapper-mongo-set'
    - OPENHIM_REGISTER=false
  ports:
    - "3003:3003"
  networks:
    - mapper-cluster-network
  depends_on:
    - mapper-mongo-1
    - mapper-mongo-2
    - mapper-mongo-3
```

execute the `docker-compose.yaml` file again to download and create the `mapper` container

```sh
docker-compose up -d
```

We can test that the OpenHIM Mediator Mapping application is running successfully by checking its `uptime`

```sh
curl http://localhost:3003/uptime
```

## Test Endpoint

Once all the containers are in a running and healthy state, we can proceed to creating some endpoints for the OpenHIM Mediator Mapping to listen on.

For more detailed instructions on how to setup the application, continue to the next step
