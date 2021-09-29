require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()

const {
    app_port = 3000,
    web_app_relative_path,
    web_app_entry_point
} = process.env

app.listen(app_port, () => {
    console.clear()
    console.log('-------------------------------')
    console.log()
    console.log('Torre - Networker')
    console.log()
    console.log('-------------------------------')
    console.log('Server listening to port ' + app_port)
    console.log('Local time: ' + new Date().toLocaleString())
})

//Define routes of controller layer
app.use('/api', require('./routes/api'))

//Error handler
app.use((error, req, res, next) => {
    const code = error instanceof ApiError ? error.errorCode : ErrorCode.INTERNAL_SERVER_ERROR
    res.status(code).json({ error: error.message })
})