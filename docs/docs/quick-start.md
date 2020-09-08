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

Download the [docker-compose.yaml](https://github.com/jembi/openhim-mediator-mapping/tree/master/resources/docker-compose.yaml) containing the relevant services for the OpenHIM Mediator Mapping service to start successfully

Run the docker compose script by executing the below command

```sh
docker-compose up -d
```

The docker images will be downloaded and the containers will be created.

You can see the running docker containers by executing the below command

```sh
docker ps
```

> **NB!** We will need need to configure our mongodb to be a replica set for the OpenHIM Mediator Mapping application to start up successfully. <br />
> To verify the `mapper` has started successfully, check the logs (`docker logs -f mapper`) of the `mapper` container to ensure everything started successfully

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

execute the `docker-compose.yaml` file again to to restart the `mapper` container so that it can successfully connect to the MongoDB replica set we configured in the previous step

```sh
docker-compose up -d
```

We can test that the OpenHIM Mediator Mapping application is running successfully by checking its `uptime`

```sh
curl http://localhost:3003/uptime
```

## Test Endpoint

Once all the containers are running, we can proceed to creating some endpoints for the OpenHIM Mediator Mapping to listen on.

For more detailed instructions on how to setup the application, continue to the next step
