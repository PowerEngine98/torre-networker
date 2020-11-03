const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const path = require('path')
const { ApiError, ErrorCode } = require('../common/api_error')

const {
    bio_profile_url,
    search_people_url
} = process.env

//Import the log middleware from sessions
const { logMiddleware } = require('./logs')

//Json body
router.use(express.json())

//Auth and Logging middleware for incoming requests
router.use('/', logMiddleware)

/*
  As the project grows, i use a layer architecture to keep the code relevant and where it needs to be, 
  by now i will just use this space for the few requests that i will handle
*/

let headers = {
    'Content-Type': 'application/json'
}

router.get('/network/:username/', async (req, res) => {
    try {
        let username = req.params.username
        if (!username) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid username')
        }
        let limit = req.query.limit
        if (!limit) {
            limit = 20
        }
        if (!Number.isInteger(Number(limit))) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid limit')
        }
        let limit_per_organization = req.query.limit_per_organization
        if (!limit) {
            limit = 5
        }
        if (!Number.isInteger(Number(limit))) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid limit_per_organization')
        }
        res.json(await getNetwork(username, limit, limit_per_organization))
    } catch (error) {
        res.status(error instanceof ApiError ? error.errorCode : ErrorCode.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
})

async function getNetwork(username, limit, limit_per_organization) {

    const users = []
    const organizations = []

    async function getUser(username) {
        let user_bio = await fetch(bio_profile_url + username).then(res => res.json())
        let user = {
            name: user_bio.person.name,
            username: user_bio.person.publicId,
            photo: user_bio.person.pictureThumbnail
        }
        //Flatten the job organizations where the user had infuence, removing repeated organizations
        let organization_names = user_bio.experiences
            .filter(experience => experience.category == 'jobs')
            .reduce((organizations, experience) => organizations.concat(experience.organizations.map(organization => organization.name)), [])
            .filter((organization_name, index, array) => array.indexOf(organization_name) == index)

        user.organizations = organization_names
        users.push(username)
        return user
    }

    async function getOrganizations(organization_names) {
        let user_organizations = []
        organization_names = organization_names.filter(organization_name => !organizations.includes(organization_name))
        for (let organization_name of organization_names) {
            organizations.push(organization_name)
            let organization = {
                name: organization_name,
                members: users.length >= limit ? [] : await getOrganizationMembers(organization_name)
            }
            user_organizations.push(organization)
        }
        return Promise.all(user_organizations)
    }

    async function getOrganizationMembers(organization_name) {
        let options = {
            organization: {
                term: organization_name
            }
        }
        let search_result = await fetch(search_people_url, {
            method: 'post',
            body: JSON.stringify(options),
            headers: headers
        }).then(res => res.json())

        let members = []
        if (search_result.results) {
            let results = search_result.results
                .filter(result => !users.includes(result.username))
                .sort((r1, r2) => r2.weight - r1.weight)
            for (let result of results) {
                if (users.length >= limit) {
                    break
                } 
                members.push(await getUser(result.username))
                if (members.length >= limit_per_organization) {
                    break
                }
            }
            for(let user of members) {
                user.organizations = await getOrganizations(user.organizations)
                user.organizations = user.organizations.filter(organization => organization.members.length > 0)
                if (users.length >= limit) {
                    break
                } 
            }
        }
        return Promise.all(members)
    }

    let user = await getUser(username)
    user.organizations = await getOrganizations(user.organizations)
    user.organizations = user.organizations.filter(organization => organization.members.length > 0)
    return user
}

module.exports = router