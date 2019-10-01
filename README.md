# Openhim Mediator Mapping

## Getting Started

> This mediator requires an accessible OpenHIM core instance before it can successfully start up.

### Environment Variables

This mediator is configured using environment variables. These are the currently configurable variables:

* SERVER_PORT
* HEARTBEAT
* LOG_LEVEL
* OPENHIM_URL
* OPENHIM_USERNAME
* OPENHIM_PASSWORD
* TRUST_SELF_SIGNED

### Docker

From the project directory run:

```sh
docker build -t mapper .

docker run --network {network-name} -p 3003:3003 --name mapper mapper
```

The network flag is optional. If connecting to a specific docker network find the network name by running:

```sh
docker network ls
```

Environmental variables can be included using the `-e` flag. For example:

```sh
docker run --network {network-name} -p 3003:3003 --name mapper -e TRUST_SELF_SIGNED=true mapper
```

### NPM

From the project directory run:

```sh
npm install
npm start
```
