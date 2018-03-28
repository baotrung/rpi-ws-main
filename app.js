const cfg = require('./config/conf.json');
var http = require('http');
const remoteRouter = require('./router/remoteRouter');
const express = require('express');
const app = express();
const logger = require('./services/logger');
var bodyParser = require('body-parser')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(remoteRouter);

var server = http.createServer(app);

server.on('error', function (err) {
    logger.err('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | FAILED');
    logger.log('SERVER START',err.stack,'DEBUG');
});

server.listen(cfg.server.port,cfg.server.host, function(err){
    if (err){
        logger.err('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | FAILED');
        logger.log(err,'DEBUG');
        return;
    }
    logger.info('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | SUCCESS');
    process.on('exit', function() {
        logger.info('SERVER STOP','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | SUCCESS');
    });
});


