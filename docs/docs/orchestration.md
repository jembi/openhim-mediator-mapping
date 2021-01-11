---
id: orchestration
title: Orchestrations
sidebar_label: Orchestrations
---

An orchestration object is created for actions performed on the input data. These orchestrations can be seen on the [openhim console](https://github.com/jembi/openhim-console) if the request is sent to the mapping mediator via the [openhim core](https://github.com/jembi/openhim-core-js).

Orchestrations are created for the following actions

- Parsing (only when the data format is changed before the mapping)
- Lookups (for each lookup done)
- Mapping (the data transformation)
- Sending of mapped data to external services (for each service)
