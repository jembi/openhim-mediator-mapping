---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

This quick start guide should get you up and running in just a few minutes (without the OpenHIM Core)

## Prerequisite

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup

Download the [docker-compose.mongo.yaml](https://github.com/jembi/openhim-mediator-mapping/blob/master/docker-compose.mongo.yml) containing the relevant services for the OpenHIM Mediator Mapping service to start successfully

Run the docker compose script by executing the below command

```sh
docker-compose -f docker-compose.mongo.yml up -d
```

The docker image will be downloaded and the containers created.

You can see the running docker containers by executing the below command

```sh
docker ps
```

> **NB!** We will need need to configure our mongodb to be a replica set for the OpenHIM Mediator Mapping application to start up successfully. <br />

To configure our MongDB replica set, we need to get inside of the docker container by executing the below

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

Exit the mongo shell then run the following command to run the Mapping Mediator:

```sh
docker run -e OPENHIM_REGISTER=false -e MONGO_URL=mongodb://mapper-mongo-1:27017,mapper-mongo-2:27017,mapper-mongo-3:27017/mapping-mediator?replicaSet=mapper-mongo-set --network mapper-cluster-network --name mapper -p 3003:3003 -d jembi/openhim-mediator-mapping:latest
```

We can test that the OpenHIM Mediator Mapping application is running successfully by checking its `uptime`

```sh
curl http://localhost:3003/uptime
```

## Test Endpoint

Once all the containers are running, we can proceed to creating some endpoints for the OpenHIM Mediator Mapping to listen on.

For more detailed instructions on how to setup the application, continue to the next step
