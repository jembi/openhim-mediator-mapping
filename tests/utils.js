'use strict'

const axios = require('axios')
const spawn = require('child_process').spawn
const sleep = require('util').promisify(setTimeout)
const {deleteEndpoints} = require('../src/db/services/endpoints')
const db = require('../src/db')
const {mongoUrl} = require('../src/config').getConfig()

const spawnServer = async envConfig => {
  const server = spawn('node', ['src/index'], {envConfig})

  server.stdout.pipe(process.stdout)
  server.stderr.pipe(process.stderr)
  server.on('error', error => {
    console.error(`Server Error: ${error}`)
  })
  server.on('close', () => console.log(`Test mapper instance exited`))

  await waitForURLReachable(
    `http://localhost:${envConfig.SERVER_PORT}/uptime`,
    1000,
    5
  ).catch(error => {
    console.error(
      `Could not reach Test Mock Mapper instance. Caused by: ${error.message}`
    )
    server.kill('SIGINT', 1)
    throw error
  })
  return server
}

const waitForURLReachable = async (url, interval, attempts) => {
  let urlStartingUp = true
  let count = 0
  do {
    await axios
      .get(url)
      .then(() => {
        urlStartingUp = false
      })
      .catch(async error => {
        if (count > attempts) {
          throw new Error(
            `Maximum (${attempts}) connection attempts reached to URL: ${url}`
          )
        }
        if (error.request) {
          // URL not ready
          await sleep(interval)
          count += 1
        } else {
          throw new Error(`Unhandled Error: ${error.message}`)
        }
      })
  } while (urlStartingUp)
}

exports.withTestMapperServer = (port, test) => {
  return async t => {
    // Before Test cleanup. We have to open two db connections for the tests as the child process's
    // db connection is not available to the test suite.
    await db.open(mongoUrl)
    await deleteEndpoints({})

    // Allow the test mapper server to make use of dynamic endpoints.
    // This is important to be able to create endpoints during tests and post data to them.
    process.env.DYNAMIC_ENDPOINTS = true

    await spawnServer({
      SERVER_PORT: port,
      DYNAMIC_ENDPOINTS: true
    })
      .then(async testMapperServer => {
        // Execute the tests
        await test(t)

        // Close the server instance after tests
        t.teardown(async () => {
          testMapperServer.kill('SIGINT', 0)
        })
      })
      .catch(error => {
        t.fail(error.message)
      })

    // Clean up the db and close db connection after tests
    t.teardown(async () => {
      await deleteEndpoints({})
      await db.close()
    })
  }
}

exports.waitForURLReachable = waitForURLReachable
