const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { ApiError, ErrorCode } = require('../../common/api_error')
const { bio_profile_url } = process.env

router.get('/:username/', async (req, res) => {
    const username = req.params.username
    if (!username) {
        throw new ApiError(ErrorCode.BAD_REQUEST, 'invalid username')
    }
    const user = await getUser(username)
    if (!username) {
        throw new ApiError(ErrorCode.BAD_REQUEST, 'User not found')
    }
    res.json(user)
})

const getUser = async (username) => {
    const user_bio = await fetch(bio_profile_url + username).then(res => res.json())
    const person = user_bio.person
    if (!person) {
        return undefined
    }
    const user = {
        name: person.name,
        username: person.publicId,
        weight: person.weight,
        photo: person.pictureThumbnail,
        organizations: []
    }
    return user
}

module.exports = router