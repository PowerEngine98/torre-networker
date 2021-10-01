const express = require('express')
const router = express.Router()
const { getOrganizations } = require('../application/organization_service')
const { handleError } = require('../common/api_error')

router.post('/:username/', handleError(async (req, res) => {
    const username = req.params.username
    const {
        exclude_organizations = [],
        exclude_users = []
    } = req.body
    let {
        limit = 15,
        limit_per_organization = 5
    } = req.query
    let options = {
        username,
        exclude_organizations,
        exclude_users,
        limit,
        limit_per_organization
    }
    const response = await getOrganizations(options)
    res.json(response)
}))

module.exports = router