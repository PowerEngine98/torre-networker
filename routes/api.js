const express = require('express')
const router = express.Router()

const users = require('./users/users')
const organizations = require('./organizations/organizations')

//Json body
router.use(express.json())

router.use('/users', users)
router.use('/organizations', organizations)

module.exports = router