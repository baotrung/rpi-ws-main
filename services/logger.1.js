const fs = require('fs');
const cfg = require('../config/conf');

class Logger{
    constructor(domain){
        switch(domain){
            case 'system' :
                this.dir = './logs/system';
                break;
            case 'firewall':
                this.dir = './logs/firewall';
            case 'restapi':
                this.dir = './logs/restapi';
            default:
                this.dir = './logs';
        }
    }

    rightnow() {
        var now = new Date(Date.now());
        var filename = now.toISOString().split('T')[0] + '.log';
        var path = this.dir + '/' + filename;
        var time = now.toTimeString();
        return {
            path: path,
            time: time
        };
    }

    info(title, msg) {
        log(title, msg, 'INFO');
    }

    err(title, msg) {
        log(title, msg, 'ERROR');
    }

    log(title, msg, level) {
        var now = rightnow();
        var line = cfg.name + '  [' + now.time + '] - [' + level + '] - ' + title + ' | ' + msg + '\n';

        if(!fs.existsSync(this.dir)){
            fs.mkdirSync(this.dir);
        }

        if (fs.existsSync(now.path)) {
            fs.appendFileSync(now.path, line);
        } else {
            fs.writeFile(now.path, line, (err) => {
                if (err) throw err;
            });
        }
    }
}

module.exports = Logger;

