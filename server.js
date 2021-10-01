require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const database = require('./common/database')

const { app_port = 3000 } = process.env

app.listen(app_port, () => {
    console.clear()
    console.log('-------------------------------')
    console.log()
    console.log('Torre - Networker')
    console.log()
    console.log('-------------------------------')
    console.log('Server listening to port ' + app_port)
    console.log('Local time: ' + new Date().toLocaleString())
    //Connect and start the database
    database.connect()
})

//Define route of controller layer
app.use('/api', require('./infraestructure/api_controller'))
