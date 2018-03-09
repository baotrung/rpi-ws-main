const fs = require('fs');
const cfg = require('../config/conf');
const LOG_DIR = './logs';


module.exports = {
    info: info,
    err: err,
    log: log
};

function rightnow() {
    var date = new Date();
    var filename = '' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + '.log';
    var path = LOG_DIR + '/' + filename;
    var time = '' + twoDigit(date.getHours()) + ':' + twoDigit(date.getMinutes()) + ':' + twoDigit(date.getSeconds());
    return {
        path: path,
        time: time
    };
}

function twoDigit(number) {
    if (number < 10) {
        return ('0' + number);
    } else {
        return ('' + number);
    }
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
    if (fs.existsSync(now.path)) {
        fs.appendFileSync(now.path, line, (err) => {
            if (err) throw err;
        });
    } else {
        fs.writeFile(now.path, line, (err) => {
            if (err) throw err;
        });
    }
}