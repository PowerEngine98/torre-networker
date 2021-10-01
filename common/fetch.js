const node_fetch = require('node-fetch')

const defaultHeaders = {
    'Content-Type': 'application/json'
}

const fetch = async (url, options) => {
    const fetchOptions = {
        method: 'get',
        headers: defaultHeaders
    }
    if (options?.method) {
        fetchOptions.method = options.method
    }
    if (options?.headers) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            ...options.headers
        }
    }
    if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body)
    }
    const response = await node_fetch(url, fetchOptions)
    return await response.json()
}

module.exports = fetch