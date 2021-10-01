const fetch = require('../common/fetch')
const { bio_profile_url } = process.env
const user_repository = require('../domain/user_repository')

/**
 * @typedef {import('./../domain/user_repository.js').User} User
 */

/**
 * @param {string} username 
 * @param {(Function} getOrganization 
 * @returns {Promise<User> | undefined} 
 */
const getUser = async (username) => {
    return await user_repository.getUser(username)
}

/**
 * @param {string} username 
 * @returns {Promise<[User, string[]]>} 
 */
const registerUserFromTorre = async (username) => {
    const user_bio = await fetch(`${bio_profile_url}/${username}`)
    const person = user_bio.person
    if (!person) {
        return []
    }
    const user = await registerUser({
        username: person.publicId,
        name: person.name,
        weight: person.weight,
        headline: person.professionalHeadline,
        photo: person.pictureThumbnail
    })
    //Flatten the organizations where the user had infuence, removing repeated organizations
    const categories = ['jobs', 'education', 'projects']
    const organization_names = user_bio.experiences
        .filter(experience => categories.includes(experience.category))
        .reduce((organizations, experience) => organizations.concat(experience.organizations.map(organization => organization.name)), [])
        .filter((organization_name, index, names) => names.indexOf(organization_name) === index)
    return [user, organization_names]
}

/** 
 * @param {User} user
 * @returns {User} 
 */
const registerUser = async (user) => {
    return await user_repository.insertUser(user)
}

module.exports = {
    getUser,
    registerUserFromTorre,
    registerUser
}