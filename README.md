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
