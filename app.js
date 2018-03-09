const cfg = require('./config/conf.json');
const remoteRouter = require('./router/remoteRouter');
const app = require('express')();
const logger = require('./services/logger');

app.use(remoteRouter);

try{
    app.listen(cfg.server.port,cfg.server.host, function(err){
        if (err){
            logger.err('SERVER STARTED','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | FAILED');
            logger.log(err,'DEBUG');
            return;
        }
        logger.info('SERVER START','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | SUCCESS');
        process.on('exit', function() {
            logger.info('SERVER STOP','host:' + cfg.server.host + '; port:' + cfg.server.port + '; | SUCCESS');
        });
    });
} catch (error) {
    logger.err('CATCH', error.message);
}


