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

router.get('/user/:username/', async (req, res) => {
    try {
        let username = req.params.username
        if (!username) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid username')
        }
        let user = await getUser(username)
        res.json(user ? user : {})
    } catch (error) {
        res.status(error instanceof ApiError ? error.errorCode : ErrorCode.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
})

router.post('/organizations/:username/', async (req, res) => {
    try {
        let username = req.params.username
        if (!username) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid username')
        }
        let limit = req.query.limit
        if (!limit) {
            limit = 15
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
        let body = req.body
        if (!body) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'missing payload')
        }
        const { users, organizations } = body
        if (!organizations || !Array.isArray(organizations)) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid organizations array')
        }
        if (!users || !Array.isArray(users)) {
            throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid users array')
        }
        res.json(await getOrganizations(username, organizations, users, limit, limit_per_organization))
    } catch (error) {
        res.status(error instanceof ApiError ? error.errorCode : ErrorCode.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
})

async function getUser(username) {
    let user_bio = await fetch(bio_profile_url + username).then(res => res.json())
    if (!user_bio.person) {
        return undefined
    }
    let user = {
        name: user_bio.person.name,
        username: user_bio.person.publicId,
        weight: user_bio.person.weight,
        photo: user_bio.person.pictureThumbnail,
        organizations: []
    }
    return user
}

async function getOrganizations(username, organizations, users, limit, limit_per_organization) {
    let total = 0
    async function getOrganizationMembers(organization_name) {
        if (total >= limit) {
            return []
        }
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
                .slice(0, limit_per_organization)
            for (let result of results) {
                users.push(result.username)
                members.push(getUser(result.username))
                total++
                if (total >= limit) {
                    break
                }
            }
        }
        return Promise.all(members)
    }

    let user_bio = await fetch(bio_profile_url + username).then(res => res.json())
    //Flatten the job organizations where the user had infuence, removing repeated organizations
    let organization_names = user_bio.experiences
        .filter(experience => experience.category == 'jobs')
        .reduce((organizations, experience) => organizations.concat(experience.organizations.map(organization => organization.name)), [])
        .filter((organization_name, index, array) => array.indexOf(organization_name) == index)
        .filter(organization_name => !organizations.includes(organization_name))

    let user_organizations = []
    for (let organization_name of organization_names) {
        let organization = {
            name: organization_name,
            members: await getOrganizationMembers(organization_name)
        }
        user_organizations.push(organization)
    }
    return Promise.all(user_organizations)
}

module.exports = router