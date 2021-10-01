module.exports = {}
const fetch = require('../common/fetch')
const { getUser } = require('./user_service')
const organization_repository = require('../domain/organization_repository')
const user_organization_repository = require('../domain/user_organization_repository')

const { search_people_url } = process.env

const getOrganizations = async (options) => {
    const {
        username,
        exclude_organizations
    } = options
    const user = await getUser(username, getOrganization)
    let organizations = await user_organization_repository.getOrganizationsByUserIdExcluding(user.id, exclude_organizations)
    options.exclude_users.push(user.username)
    const search = new OrganizationSearch(organizations, options)
    return await search.search()
}

const getOrganization = async (name) => {
    let organization = await organization_repository.getOrganization(name)
    if (organization) {
        return organization
    }
    return await organization_repository.insertOrganization({ name })
}

class OrganizationSearch {

    constructor(organizations, options) {
        console.log(options)
        this.organizations = organizations
        this.exclude_users = options.exclude_users
        this.limit = options.limit
        this.limit_per_organization = options.limit_per_organization
        this.total = 0
    }

    async search() {
        for(const organization of this.organizations) {
            const members = await this.getOrganizationUsers(organization)
            if(members) {
                organization.members = members
            }
        }
        return this.organizations
    }

    async getOrganizationUsers(organization) {
        if (this.total >= this.limit) {
            return []
        }
        const users = await user_organization_repository.getUsersByOrganizationIdExcluding(organization.id, this.exclude_users)
        users.forEach(user => {
            this.total++
            this.exclude_users.push(user.username)
        })
        if (this.total >= this.limit) {
            return users
        }
        const search_result = await fetch(search_people_url, {
            method: 'post',
            body: {
                organization: {
                    term: organization.name
                }
            }
        })
        if (!search_result.results) {
            return users
        }
        const results = search_result.results
            .filter(result => !this.exclude_users.includes(result.username))
            .filter((result, index, results) => results.indexOf(result) === index)
            .sort((r1, r2) => r2.weight - r1.weight)
            .slice(0, this.limit_per_organization)
        results.forEach(r => {
            this.exclude_users.push(r.username)
        })
        for (let result of results) {
            this.total++
            const user = getUser(result.username, getOrganization)
            users.push(result.username)
            this.exclude_users.push(result.username)
            console.log(this.total, result.username)
            if (this.total >= this.limit) {
                break
            }
        }
        return users
    }

}

module.exports = {
    getOrganizations,
    getOrganization
}