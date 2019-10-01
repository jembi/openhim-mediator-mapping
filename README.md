# Openhim Mediator Mapping

## Getting Started

> This mediator requires an accessible OpenHIM core instance before it can successfully start up.

### Docker

From the project directory run:

```sh
docker build -t scaffold .

docker run --network {network-name} -p 3000:3000 --name scaffold scaffold
```

The network flag is optional. If connecting to a specific docker network find the network name by running:

```sh
docker network ls
```

Environmental variables can be included using the `-e` flag. For example:

```sh
docker run --network {network-name} -p 3000:3000 --name scaffold -e OPENHIM_TRUST_SELF_SIGNED=true scaffold
```

### NPM

From the project directory run:

```sh
npm install
npm start
```
