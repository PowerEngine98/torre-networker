const fs = require('fs')
const path = require('path')
const colors = require('colors')
const express = require('express')
const router = express.Router()
const locale = require('../assets/locale.json')

let logFile = fs.createWriteStream('logs.log', { flags: 'a' })
let oldConsole = Object.assign({}, console)

Object.assign(console, {
    log: (element, ...args) => log(element, ...args),
    info: (element, ...args) => info(element, ...args),
    warn: (element, ...args) => warn(element, ...args),
    error: (element, ...args) => error(element, ...args)
})

function log(element, ...args) {
    customLog(undefined, colors.white, oldConsole.log, element, ...args)
}

function info(element, ...args) {
    customLog('INFO', colors.cyan, oldConsole.info, element, ...args)
}

function warn(element, ...args) {
    customLog('WARN', colors.yellow, oldConsole.warn, element, ...args)
}

function error(element, ...args) {
    customLog('ERROR', colors.red, oldConsole.error, element, ...args)
}

function logColor(color, element, ...args) {
    customLog(undefined, color, oldConsole.log, element, ...args)
}

let colorArray = [colors.gray, undefined, colors.cyan, undefined, colors.gray, undefined]

function customLog(prefix, color, method, element, ...args) {
    let date = new Date()
    let prefixes = ['[', date.toLocaleDateString(locale.locale, locale.options), ' | ', date.toLocaleTimeString(locale.locale, locale.options), ']', ':']
    if (element) {
        args.unshift(element)
        let colorPrefix = prefixes.map((element, i) => {
            if(colorArray[i]) {
                return colorArray[i](element)
            }
            return element
        }).join('')
        let prefixName = prefix ? ' [' + prefix + ']:' : ''
        method(colorPrefix + color(prefixName), ...args.slice().map(arg => color(arg)))
        args.unshift(prefixName)
    }
    else {
        method()
    }
    let reduceArgs = (line, arg, index, array) => line + (typeof arg == 'string' ? arg : JSON.stringify(arg)) + (index < array.length - 1 ? ' ' : '')
    logFile.write(args.reduce(reduceArgs, prefixes.join('')) + '\n')
}

router.get('/', (req, res) => {
    res.sendFile('logs.log', { root: path.join(__dirname, '../') })
})

const logMiddleware = (req, res, next) => {
    let color
    switch (req.method) {
        case 'GET':
            color = colors.cyan
            break
        case 'POST':
            color = colors.green
            break
        case 'PUT':
            color = colors.yellow
            break
        case 'DELETE':
            color = colors.red
            break
        default:
            color = colors.white
            break
    }
    logColor(color, req.hostname + ' -> ' + req.method, req.url)
    next()
}

module.exports = {
    router, 
    logMiddleware,
    log, 
    info, 
    warn, 
    error,
    logColor
}