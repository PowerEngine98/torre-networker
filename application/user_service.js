const fetch = require('../common/fetch')
const { bio_profile_url } = process.env
const user_repository = require('../domain/user_repository')
const user_organization_repository = require('../domain/user_organization_repository')

const categories = ['jobs', 'education', 'projects']

const getUser = async (username, getOrganization) => {
    let user = await user_repository.getUser(username)
    if (user) {
        return user
    }
    return await registerUserFromTorre(username, getOrganization)
}

const registerUserFromTorre = async (username, getOrganization) => {
    const user_bio = await fetch(`${bio_profile_url}/${username}`)
    const person = user_bio.person
    if (!person) {
        return undefined
    }
    const user = await user_repository.insertUser({
        username: person.publicId,
        name: person.name,
        weight: person.weight,
        headline: person.professionalHeadline,
        photo: person.pictureThumbnail
    })
    linkOrganizations(user, user_bio.experiences, getOrganization)
    return user
}

const linkOrganizations = async (user, experiences, getOrganization) => {
    //Flatten the organizations where the user had infuence, removing repeated organizations
    const organization_names = experiences
        .filter(experience => categories.includes(experience.category))
        .reduce((organizations, experience) => organizations.concat(experience.organizations.map(organization => organization.name)), [])
        .filter((organization_name, index, names) => names.indexOf(organization_name) === index)
    const organizations = await Promise.all(organization_names.map(getOrganization))
    //Multi insert to improve performance
    const user_organizations = organizations.map(organization => [
        user.id,
        organization.id
    ])
    user_organization_repository.insertUserOrganizations(user_organizations)
}

module.exports = {
    getUser
}