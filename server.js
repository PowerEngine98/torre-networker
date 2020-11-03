require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')

//Envoirment variables
const {
    app_port = 3000,
    web_app_serve_local = true,
    web_app_relative_path,
    web_app_entry_point
} = process.env

//Routes for request layer
const api = require('./routes/api')

//Start the server
let server = app.listen(app_port, () => {
    console.clear()
    console.log('-------------------------------')
    console.log()
    console.log('Torre - Networker')
    console.log()
    console.log('-------------------------------')
    console.log('Server listening to port ' + app_port)
    console.log('Local time: ' + new Date().toLocaleString())
})

//Cors middelware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    }
    else {
        next()
    }
})

//Define routes
app.use('/api', api)

//Static web app served locally
if (String(web_app_serve_local) == 'true') {

    app.use(express.static(path.join(__dirname, web_app_relative_path)))

    app.get('/*', (req, res) => {
        res.sendFile(path.join(path.join(__dirname, web_app_relative_path), web_app_entry_point))
    })
}

//Shutdown handling
let connections = []

server.on('connection', connection => {
    connections.push(connection)
    connection.on('close', () => connections = connections.filter(connection => connection !== connection))
})

process.on('SIGTERM', end)
process.on('SIGINT', end)

function end() {
    console.log('Received kill signal, shutting down gracefully')
    shutDown()
}

function shutDown(callback) {

    server.close(() => {
        console.log('Closed out remaining connections')
        if (callback) {
            callback()
        }
        process.exit(0)
    })

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down')
        if (callback) {
            callback()
        }
        process.exit(1)
    }, 5000)

    connections.forEach(connection => connection.end())
    setTimeout(() => {
        connections.forEach(connection => connection.destroy())
    }, 2000)
}