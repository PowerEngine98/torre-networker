const express = require('express')
const router = express.Router()
//Import the log middleware from sessions
const { logMiddleware } = require('./logs')

//Json body
router.use(express.json())

//Auth and Logging middleware for incoming requests
router.use('/', logMiddleware)

/*
  As the project grows, i use a layer architecture to keep the code relevant and where it needs to be, 
  by now i will just use this space for the little requests that i will handle
*/

module.exports = router