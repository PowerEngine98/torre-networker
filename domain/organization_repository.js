const database = require('../common/database')

const insertOrganization = async (organization) => {
    const query = {
        name: 'insert-organization',
        text: 'INSERT INTO organization (name, created_at) VALUES($1, NOW()) RETURNING *'
    }
    query.values = [
        organization.name
    ]
    const response = await database.query(query)
    return response.rows[0]
}

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

module.exports = {
    insertOrganization,
    getOrganization,
    getOrganizationById
}