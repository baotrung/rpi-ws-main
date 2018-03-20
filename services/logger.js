const fs = require('fs');
const cfg = require('../config/conf');
const LOG_DIR = './logs';


module.exports = {
    info: info,
    err: err,
    log: log
};

function rightnow() {
    var now = new Date(Date.now()).toISOString().split('T');
    var filename = now[0] + '.log';
    var path = LOG_DIR + '/' + filename;
    var time = now[1].split('.')[0];
    return {
        path: path,
        time: time
    };
}

function info(title, msg) {
    log(title, msg, 'INFO');
}

function err(title, msg) {
    log(title, msg, 'ERROR');
}

function log(title, msg, level) {
    var now = rightnow();
    var line = cfg.name + '  [' + now.time + '] - [' + level + '] - ' + title + ' | ' + msg + '\n';

    if(!fs.existsSync(LOG_DIR)){
        fs.mkdirSync(LOG_DIR);
    }

    if (fs.existsSync(now.path)) {
        fs.appendFileSync(now.path, line);
    } else {
        fs.writeFile(now.path, line, (err) => {
            if (err) throw err;
        });
    }
}