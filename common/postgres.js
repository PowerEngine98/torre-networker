const { Pool, Client, types } = require('pg')
types.setTypeParser(types.builtins.NUMERIC, value => value === null ? null : Number(value))

const defaultOptions = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres',
    schema: 'public'
}

/**
 * @async
 * @callback transactionFunction an async function that uses a client to execute queries in a transaction context
 * @param {Client} client the database client used for this transaction
 * @returns {Promise<any>} 
 * 
 * @typedef PostgreSQLConnectOptions
 * @property {string} host
 * @property {number|string} [port]
 * @property {string} [user]
 * @property {string} [password]
 * @property {string} [database]
 * @property {string} [schema]
 */
class PostgresSQLManager {

    /** 
    * @param {PostgreSQLConnectOptions} options 
    */
    async connect(options = defaultOptions) {
        this.pool = new Pool(options)
        this.pool.on('error', (error) => {
            console.error('Unexpected pooling error on idle client', error)
            process.exit(-1)
        })
        await this.pool.query('SELECT NOW()')
    }

    async end() {
        await this.pool.end()
    }

    /**
     * @returns {Client}
     */
    async getConnection() {
        return await this.pool.connect()
    }

    async query() {
        const client = await this.getConnection()
        try {
            return await client.query.apply(client, arguments)
        }
        finally {
            client.release()
        }
    }

    /**
     * Handles a transaction in the connection the pool
     * @param {transactionFunction} transactionFunction an async function using the database client in a transaction context, if any error is thrown the transaction executes a rollback and the client is released,
     * if the function ends without issues a commit query is executed   
     */
    async transaction(transactionFunction) {
        const client = await this.getConnection()
        try {
            await client.query('BEGIN')
            const commitValue = await transactionFunction(client)
            await client.query('COMMIT')
            return commitValue
        } catch (error) {
            await client.query('ROLLBACK')
            throw error
        }
        finally {
            client.release()
        }
    }

}

module.exports = PostgresSQLManager