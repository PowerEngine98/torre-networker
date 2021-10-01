const fs = require('fs')
const PostgresSQLManager = require('./postgres')

const {
    networker_database_host,
    networker_database_port,
    networker_database_user,
    networker_database_password,
    networker_database_db,
    networker_database_schema
} = process.env

class NetworkerDatabase extends PostgresSQLManager {

    async connect() {
        try {
            const options = {
                host: networker_database_host,
                port: networker_database_port,
                user: networker_database_user,
                password: networker_database_password,
                database: networker_database_db,
                schema: networker_database_schema,
                max: 100
            }
            await super.connect(options)
            //Init the database and create tables
            const db_script = fs.readFileSync('./assets/db_script.sql').toString()
            await this.query(db_script)
            console.log('PostgreSQL connection pool created')
        } catch (error) {
            console.error('Error connecting to the PostgreSQL database:', error)
        }
    }
}

module.exports = new NetworkerDatabase()