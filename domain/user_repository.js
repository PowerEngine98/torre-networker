const database = require('../common/database')

const insertUser = async (user) => {
    const query = {
        name: 'insert-user',
        text: 'INSERT INTO "user"(username, name, weight, headline, photo, created_at) VALUES($1, $2, $3, $4, $5, NOW()) RETURNING *'
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