const database = require('../common/database')
var format = require('pg-format')

const insertUserOrganizations = async (user_organizations) => {
    const response = await database.query(format('INSERT INTO user_organization (user_id, organization_id) VALUES %L RETURNING *', user_organizations))
    return response.rows[0]
}

const getUserOrganizationsByUserId = async (user_id) => {
    const query = 'SELECT o.* FROM user_organization AS uo INNER JOIN organization AS o ON uo.organization_id = o.id WHERE uo.user_id=$1'
    const values = [
        user_id
    ]
    const response = await database.query(query, values)
    return response.rows
}

const getOrganizationsByUserIdExcluding = async (user_id, not_in) => {
    const query = format('SELECT o.* FROM user_organization AS uo INNER JOIN organization AS o ON uo.organization_id = o.id WHERE uo.user_id = %s AND o.id NOT IN (%s)', user_id, not_in)
    const response = await database.query(query)
    return response.rows
}

const getUsersByOrganizationIdExcluding = async (organization_id, not_in) => {
    const query = format('SELECT u.* FROM user_organization AS uo INNER JOIN "user" AS u ON uo.user_id = u.id WHERE uo.organization_id = %s AND u.username NOT IN (%L)', organization_id, not_in)
    const response = await database.query(query)
    return response.rows
}

module.exports = {
    insertUserOrganizations,
    getUserOrganizationsByUserId,
    getOrganizationsByUserIdExcluding,
    getUsersByOrganizationIdExcluding
}