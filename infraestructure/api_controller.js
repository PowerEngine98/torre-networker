const express = require('express')
const router = express.Router()

router.use(express.json())

router.use('/users', require('./user_controller'))
router.use('/organizations', require('./organization_controller'))

module.exports = router