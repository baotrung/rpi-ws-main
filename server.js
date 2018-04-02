const cfg = require('./config/conf.json')
const http = require('http')
const express = require('express')
const app = express()
const Logger = require('./app/logger')
const logger = new Logger('system')
const bodyParser = require('body-parser')

app.use( bodyParser.json() )       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))

app.use(require('./app/router'))

var server = http.createServer(app)

server.on('error', (err) => {
    logger.err('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + ' | FAILED')
    logger.log('SERVER START',err.stack,'DEBUG')
})

server.listen(cfg.server.port,cfg.server.host, (err) => {
    if (err){
        logger.err('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + ' | FAILED')
        logger.log(err,'DEBUG')
        return
    }
    logger.info('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + ' | SUCCESS')
})


