const database = require('../common/database')
const format = require('pg-format')
const user_organization_repository = require('./user_organization_repository')

/**
 * @typedef {import('./user_repository').User} User
 * 
 * @typedef Organization
 * @property {number} id
 * @property {string} name
 * @property {User[]} members
 */

/**
 * @param {string} name 
 * @returns {Promise<Organization>}
 */
const getOrganization = async (name) => {
    const query = {
        name: 'get-organization',
        text: 'SELECT * FROM organization WHERE name=$1'
    }
    query.values = [
        name
    ]
    const response = await database.query(query)
    return response.rows?.[0]
}

/**
 * @param {number} id 
 * @returns {Promise<Organization>}
 */
const getOrganizationById = async (id) => {
    const query = {
        name: 'get-organization-id',
        text: 'SELECT * FROM organization WHERE id=$1'
    }
    query.values = [
        id
    ]
    const response = await database.query(query)
    return response.rows?.[0]
}

/**
 * @param {number} user_id
 * @param {string[]} organization_names  
 * @returns {Promise<Organization[]>}
 */
const linkUserToOrganizations = async (user_id, organization_names) => {
    const values = organization_names.map(name => [name])
    return database.transaction(async (client) => {
        const response = await client.query(format('INSERT INTO organization (name) VALUES %L ON CONFLICT("name") DO UPDATE SET name=EXCLUDED.name RETURNING *', values))
        const organizations = response.rows
        const user_organizations = organizations.map(organization => [
            user_id,
            organization.id
        ])
        await user_organization_repository.insertUserOrganizations(client, user_organizations)
        return organizations
    })
}

module.exports = {
    linkUserToOrganizations,
    getOrganization,
    getOrganizationById
}