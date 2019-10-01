'use strict'

import express from 'express'

// The OpenHIM Mediator Utils is an essential package for quick mediator setup.
// It handles the OpenHIM authentication, mediator registration, and mediator heartbeat.
import {
  registerMediator,
  activateHeartbeat,
  fetchConfig
} from 'openhim-mediator-utils'

// The mediatorConfig file contains some basic configuration settings about the mediator
// as well as details about the default channel setup.
import mediatorConfig, { urn } from './mediatorConfig.json'

// The config details here are used to authenticate and register the mediator with the OpenHIM instance
const openhimConfig = {
  username: 'root@openhim.org',
  password: 'password',
  apiURL: 'https://openhim-core:8080',
  trustSelfSigned: true,
  urn
}

const app = express()

// Any request regardless of request type or url path to the mediator port will be caught here
// and trigger the Hello World response.
app.all('*', (_req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server listening on port 3000...')

  mediatorSetup()
})

const mediatorSetup = () => {
  // The purpose of registering the mediator is to allow easy communication between the mediator and the OpenHIM.
  // The details received by the OpenHIM will allow quick channel setup which will allow tracking of requests from
  // the client through any number of mediators involved and all the responses along the way(if the mediators are
  // properly configured). Moreover, if the request fails for any reason all the details are recorded and it can
  // be replayed at a later date to prevent data loss.
  registerMediator(openhimConfig, mediatorConfig, err => {
    if (err) {
      console.error('Failed to register mediator. Check your Config: ', err)
      process.exit(1)
    }

    console.log('Successfully registered mediator!')

    fetchConfig(openhimConfig, (err, initialConfig) => {
      if (err) {
        console.error('Failed to fetch initial config: ', err)
        process.exit(1)
      }
      console.log('Initial Config: ', JSON.stringify(initialConfig))

      // The activateHeartbeat method returns an Event Emitter which allows the mediator to attach listeners waiting
      // for specific events triggered by OpenHIM responses to the mediator posting its heartbeat.
      const emitter = activateHeartbeat(openhimConfig)

      emitter.on('error', err => {
        console.error('Heartbeat failed: ', err)
      })

      // The config events is emitted when the heartbeat request posted by the mediator returns data from the OpenHIM.
      emitter.on('config', newConfig => {
        console.log('Received updated config:', JSON.stringify(newConfig))
      })
    })
  })
}
