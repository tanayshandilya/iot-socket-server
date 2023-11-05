import { io } from 'socket.io-client'

const SERVER_HOST = 'http://localhost:8080'

export const socket = io(SERVER_HOST, {
  autoConnect: false,
})
