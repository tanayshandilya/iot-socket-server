import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import http from 'http'
import express from 'express'
import chalk from 'simple-chalk'
import { Server } from 'socket.io'
import { events, logError, logEvent } from './socket.js'
import db from './models/device.js'
import { record } from './controllers/index.js'

const app = express()
const PORT = process.env.NODE_PORT

app.use(cors())
app.use(express.json())
app.get('*', (req, res) => {
  res.json({
    server: 'socket',
  })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.listen(process.env.SOCKET_PORT)

io.sockets.on('connection', (socket) => {
  console.clear()
  logEvent('connection', '')

  socket.on(events.client.init, (msg) => {
    logEvent(events.client.init, msg)
    db.read()
      .then(() => {
        msg.socketId = socket.id
        msg.connected = true
        msg.messages = []
        db.data.client = record.create(msg)
        db.write()
          .then(() => {
            io.to(socket.id).emit(events.client.init, {
              clientId: db.data.client.id,
            })
          })
          .catch(logError)
      })
      .catch(logError)
  })

  socket.on(events.client.stream, (msg) => {
    logEvent(events.client.stream, msg)
    db.read()
      .then(() => {
        db.data.client.messages.push({
          content: msg.message,
          timestamp: new Date().toJSON(),
        })
        db.write()
          .then(() => {
            io.to(db.data.device.socketId).emit(
              events.device.stream,
              msg.message
            )
          })
          .catch(logError)
      })
      .catch(logError)
  })

  socket.on(events.device.init, (msg) => {
    logEvent(events.device.init, msg)
    db.read()
      .then(() => {
        ;(msg.socketId = socket.id), (msg.messages = [])
        msg.connected = true
        db.data.device = record.create(msg)
        db.write()
          .then(() => {
            io.to(socket.id).emit(events.device.init, {
              deviceId: db.data.device.id,
            })
            io.to(db.data.client.socketId).emit(events.client.stream, {
              type: 'device-connected',
              data: db.data.device,
            })
          })
          .catch(logError)
      })
      .catch(logError)
  })

  socket.on(events.device.stream, (msg) => {
    logEvent(events.device.stream, msg)
    db.read()
      .then(() => {
        db.data.device.messages.push({
          content: msg,
          timestamp: new Date().toJSON(),
        })
        db.write()
          .then(() => {
            io.to(db.data.client.socketId).emit(events.client.stream, {
              type: 'device-message',
              data: db.data.device.messages,
            })
            io.to(socket.id).emit(events.device.stream, 'ok')
          })
          .catch(logError)
      })
      .catch(logError)
  })
})

io.sockets.on('disconnect', () => {
  db.data.client = {}
  db.data.device = {}
  db.write()
})

app.listen(PORT, () => {
  console.log(' ')
  console.log(' ')
  console.log(
    chalk.greenBright('Node Server:  ') +
      chalk.cyanBright(process.env.NODE_ENV.toUpperCase())
  )
  console.log(' ')
  console.log(
    chalk.green(
      `➜  NodeLocal:   ${chalk.cyanBright(`http://127.0.0.1:${PORT}`)}`
    )
  )
  console.log(' ')
})
