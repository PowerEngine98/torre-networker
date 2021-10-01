const database = require('../common/database')

/**
 * @typedef User
 * @property {number} id
 * @property {string} username
 * @property {string} name
 * @property {number} weight
 * @property {string} headline
 * @property {string} photo
 */

/**
 * @param {User} user
 * @returns {Promise<User>} 
 */
const insertUser = async (user) => {
    const query = {
        name: 'insert-user',
        text: 'INSERT INTO "user"(username, name, weight, headline, photo) VALUES($1, $2, $3, $4, $5) RETURNING *'
    }
    query.values = [
        user.username,
        user.name,
        user.weight,
        user.headline,
        user.photo
    ]
    const response = await database.query(query)
    return response.rows[0]
}

/**
 * @param {string} username
 * @returns {Promise<User>} 
 */
const getUser = async (username) => {
    const query = {
        name: 'get-user',
        text: 'SELECT * FROM "user" WHERE username=$1'
    }
    query.values = [
        username
    ]
    const response = await database.query(query)
    return response.rows?.[0]
}

/**
 * @param {number} id
 * @returns {Promise<User>} 
 */
const getUserById = async (id) => {
    const query = {
        name: 'get-user-id',
        text: 'SELECT * FROM "user" WHERE id=$1'
    }
    query.values = [
        id
    ]
    const response = await database.query(query)
    return response.rows?.[0]
}

module.exports = {
    insertUser,
    getUser,
    getUserById
}