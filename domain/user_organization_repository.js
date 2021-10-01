const database = require('../common/database')
const format = require('pg-format')
const { Client } = require('pg')

/**
 * @typedef {import('./../domain/user_repository.js').User} User
 * @typedef {import('./../domain/organization_repository.js').Organization} Organization
 * 
 * @typedef UserOrganization
 * @property {number} user_id 
 * @property {number} organization_id  
 */

/**
 * @param {Client}
 * @param {[number,number][]} user_organizations 
 * @returns {UserOrganization[]}
 */
const insertUserOrganizations = async (client, user_organizations) => {
    const response = await client.query(format('INSERT INTO user_organization (user_id, organization_id) VALUES %L RETURNING *', user_organizations))
    return response.rows
}

/**
 * @param {number} user_id 
 * @returns {User[]}
 */
const getUserOrganizationsByUserId = async (user_id) => {
    const query = 'SELECT o.* FROM user_organization AS uo INNER JOIN organization AS o ON uo.organization_id = o.id WHERE uo.user_id=$1'
    const values = [
        user_id
    ]
    const response = await database.query(query, values)
    return response.rows
}

/**
 * @param {number} user_id
 * @param {number[]} not_in array of id's of users to exclude 
 * @returns {Organization[]} 
 */
const getOrganizationsByUserIdExcluding = async (user_id, not_in) => {
    const query = format('SELECT o.* FROM user_organization AS uo INNER JOIN organization AS o ON uo.organization_id = o.id WHERE uo.user_id = %s AND o.id NOT IN (%s)', user_id, not_in)
    const response = await database.query(query)
    return response.rows
}

/**
 * @param {number} organization_id
 * @param {string[]} not_in array of usernames of users to exclude 
 * @returns {User[]} 
 */
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