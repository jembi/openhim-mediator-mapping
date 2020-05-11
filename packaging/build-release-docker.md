# OpenHIM Mediator Mapping - Docker Build

The below steps will take you through the process of building a new Docker images for a specific version

> **NB!** <br />
> Please ensure that you are on the correct codebase/version when building a new Docker images. <br />
> You will also need to ensure that you are logged into your Dockerhub account from your terminal when running the below `push` command or the upload will fail

## Build a new images

We need to create two new Docker images, one for the new version we are creating, as well as to update the `latest` image

Execute the below commands from within the project root directory to create a new Docker image

```sh
docker build -t jembi/openhim-mediator-mapping:latest .
docker build -t jembi/openhim-mediator-mapping:<VERSION_TAG> .
```

## Push new images to Dockerhub

Once we have our images built for the specified tag and for the latest tag, we can proceed to pushing these images to Dockerhub

Execute the below commands to push a Docker image to Dockerhub

```sh
docker push jembi/openhim-mediator-mapping:latest
docker push jembi/openhim-mediator-mapping:<VERSION_TAG>
```
