'use strict'

import express from 'express'

import {
  registerMediator,
  activateHeartbeat,
  fetchConfig
} from 'openhim-mediator-utils'

import mediatorConfig, { urn } from './mediatorConfig.json'

const openhimConfig = {
  username: 'root@openhim.org',
  password: 'password',
  apiURL: 'https://openhim-core:8080',
  trustSelfSigned: true,
  urn
}

const app = express()

app.all('*', (_req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server listening on port 3000...')

  mediatorSetup()
})

const mediatorSetup = () => {
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

      const emitter = activateHeartbeat(openhimConfig)

      emitter.on('error', err => {
        console.error('Heartbeat failed: ', err)
      })

      emitter.on('config', newConfig => {
        console.log('Received updated config:', JSON.stringify(newConfig))
      })
    })
  })
}
