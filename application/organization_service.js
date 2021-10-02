const fetch = require('../common/fetch')
const { getUser, registerUserFromTorre, registerUser } = require('./user_service')
const organization_repository = require('../domain/organization_repository')
const user_organization_repository = require('../domain/user_organization_repository')

const { search_people_url } = process.env

/**
 * @typedef {import('./user_service.js').User} User
 * @typedef {import('../domain/organization_repository.js').Organization} Organization
 */

/**
 * @param {*} options 
 * @returns {Organization[]}
 */
const getOrganizations = async (options) => {
    const {
        username,
        exclude_organizations
    } = options
    //Get or create a user to get his organizations
    let user = await getUser(username)
    let organizations
    if (user) {
        organizations = await user_organization_repository.getOrganizationsByUserIdExcluding(user.id, exclude_organizations)
    }
    else {
        const [newUser, organization_names] = await registerUserFromTorre(username)
        user = newUser
        organizations = await organization_repository.linkUserToOrganizations(user.id, organization_names)
    }
    options.exclude_users.push(username)
    return await new OrganizationSearch(organizations, options).search()
}

/**
 * 
 * @param {string} name 
 * @returns {Organization}
 */
const getOrganization = async (name) => {
    const organization = await organization_repository.getOrganization(name)
    if (organization) {
        return organization
    }
    return await organization_repository.insertOrganization({ name })
}

//Scope to track and stop the search
class OrganizationSearch {

    constructor(organizations, options) {
        this.organizations = organizations
        this.exclude_users = new Set(options.exclude_users)
        this.limit = options.limit
        this.limit_per_organization = options.limit_per_organization
        this.total = 0
    }

    async search() {
        return new Promise(async (resolve, reject) => {
            const onResult = (organization, user) => {
                if (!organization.members) {
                    organization.members = []
                }
                organization.members.push(user)
                this.exclude_users.add(user.username)
                this.total++
                if (this.total >= this.limit) {
                    resolve(this.organizations)
                    return true
                }
                return false
            }
            try {
                const promises = this.organizations.map(organization => this.getOrganizationUsers(organization, onResult))
                await Promise.all(promises)
                resolve(this.organizations)
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
    * Inserts a user to the database and create a relation with his organizations, makes faster future searchs, this ensures eventual consistency
    * @param {User} user 
    * @param {string[]} organization_names 
    */
    async registerAndLinkUser(user, organization_names) {
        const existentUser = await getUser(user.username)
        if (!existentUser) {
            const newUser = await registerUser(user)
            organization_repository.linkUserToOrganizations(newUser.id, organization_names)
        }
    }

    async getOrganizationUsers(organization, onResult) {
        const users = await user_organization_repository.getUsersByOrganizationIdExcluding(organization.id, Array.from(this.exclude_users))
        if (users.length > 0) {
            await user_organization_repository.getOrganizationNamesOfUsers(users)
        }
        for (const user of users) {
            if (onResult(organization, user)) {
                return
            }
        }
        const search_result = await fetch(`${search_people_url}?size=${this.limit_per_organization}`, {
            method: 'post',
            body: {
                organization: {
                    term: organization.name
                }
            }
        })
        if (!search_result.results) {
            return
        }
        const results = search_result.results
            .filter(result => !this.exclude_users.has(result.username))
            .filter((result, index, results) => results.indexOf(result) === index)
            .sort((r1, r2) => r2.weight - r1.weight)
        for (let result of results) {
            const organization_names = result._meta.filter.input.person.organizations
            const user = {
                username: result.username,
                name: result.name,
                weight: result.weight,
                headline: result.professionalHeadline,
                photo: result.picture,
                organizations: organization_names
            }
            this.registerAndLinkUser(user, organization_names)
            if (onResult(organization, user)) {
                return
            }
        }
    }

}

module.exports = {
    getOrganizations,
    getOrganization
}