const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { search_people_url, bio_profile_url } = process.env

let headers = {
    'Content-Type': 'application/json'
}

router.post('/:username/', async (req, res) => {
  res.send(req.params.username)
})

module.exports = router