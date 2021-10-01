const express = require('express')
const router = express.Router()
const { getUser } = require('../application/user_service')
const { getOrganization } = require('../application/organization_service')
const {
    ApiError,
    ErrorCode,
    handleError
} = require('../common/api_error')


router.get('/:username/', handleError(async (req, res) => {
    const username = req.params.username
    if (!username) {
        throw new ApiError(ErrorCode.BAD_REQUEST, 'Invalid username')
    }
    const user = await getUser(username, getOrganization)
    if (!user) {
        throw new ApiError(ErrorCode.BAD_REQUEST, 'User not found')
    }
    res.json(user)
}))

module.exports = router