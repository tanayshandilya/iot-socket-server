# iot-socket-server
A simple nodejs based dahsboard for socket testing of IoT devices.

## How to install

### Clone Repository
`git clone <git url>`

### Install Dependencies
Install base dependencies:
`npm install`

Install client dependencies:
`cd client/`
`npm install`

Install global dependencies:
`npm i -g concurrently`

## How to run

### Setup environment vars

Create .env file in root dir
`touch .env`

Set variables
```env NODE_ENV='dev'```
```env NODE_PORT=8000```
```env SOCKET_PORT=8080```

### Dev environment (recommended)

Run from root dir
`npm run dev`

### Prod environment 

Run from root dir
`npm start`

### Open web client

Open the below url to access the client
`http://localhost:5173`

To send messages from device connect on below url
`http://localhost:8080`
