import chalk from 'simple-chalk'
import db from './models/index.js'
import { record } from './controllers/index.js'

const events = {
  client: {
    init: 'client-init',
    stream: 'client-stream',
  },
  device: {
    init: 'device-init',
    stream: 'device-stream',
  },
}

function logEvent(evName, evData) {
  console.log(
    chalk.greenBright(`➜  SOCKET-SERVER: `) +
      chalk.cyanBright(`"${evName}"   `) +
      chalk.red(typeof evData === 'object' ? JSON.stringify(evData) : evData)
  )
}

function logError(err) {
  console.log(chalk.greenBright(`➜  SOCKET-SERVER: `) + chalk.red(err.toString))
}

function manageConnection(socket, io) {
  socket.on(events.client.init, (msg) => {
    logEvent(events.client.init, msg)
    db.read()
      .then(() => {
        msg.socketId = socket.id
        const client = record.create(msg)
        db.data.client = client
        db.write()
          .then(() => {
            io.to(socket.id).emit(events.client.stream, {
              type: 'device-list',
              device: db.data.devices,
            })
            io.to(socket.id).emit(events.client.init, {
              clientId: client.id,
            })
          })
          .catch((e) => {
            console.log('DB Write ERR: ', e)
          })
      })
      .catch((e) => {
        console.log('DB Write ERR: ', e)
      })
  })

  socket.on(events.device.init, (msg) => {
    logEvent(events.device.init, msg)
    db.read()
      .then(() => {
        const index = db.data.devices.findIndex((d) => d.socketId === socket.id)
        const exists = db.data.devices[index]?.socketId === socket.id
        msg.socketId = socket.id
        msg.messages = []
        if (!exists) {
          const device = record.create(msg)
          db.data.devices.push(device)
          db.write()
            .then(() => {
              io.to(db.data.client.socketId).emit(events.client.stream, {
                type: 'new-devices',
                devices: db.data.devices,
              })
              io.to(socket.id).emit(events.device.init, {
                deviceId: device.id,
              })
            })
            .catch((e) => {
              console.log('DB Write ERR: ', e)
            })
        }
      })
      .catch((e) => {
        console.log('DB Write ERR: ', e)
      })
  })

  socket.on(events.device.stream, (msg) => {
    logEvent(events.device.stream, msg)
    db.read()
      .then(() => {
        const { devices } = db.data
        const index = devices.findIndex((d) => d.socketId === socket.id)
        const oldMessages = devices[index].messages
        devices[index].messages.push(msg)
        db.write()
          .then(() => {
            io.to(db.data.client.socketId, {
              type: 'device-message',
              messages: [...oldMessages, msg],
            })
            io.to(socket.id, 'ok')
          })
          .catch((e) => {
            console.log('DB Write ERR: ', e)
          })
      })
      .catch((e) => {
        console.log('DB Write ERR: ', e)
      })
  })
}

export { events, logEvent, logError }
