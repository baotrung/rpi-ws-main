const fs = require('fs')
const cfg = require('../config/conf')

class Logger{
    constructor(domain){
        if(cfg.logger.paths.hasOwnProperty(domain)){
            this.dir = cfg.logger.paths[domain]
        }else{
            this.dir = cfg.logger.paths.default
        }
    }

    ensureExistDir(path){
        var pathArr = path.split('/')
        var dirCursor = ''
        pathArr.forEach(item => {
            dirCursor += item
            if(item != '' && item != '.'){
                if(!fs.existsSync(dirCursor)){
                    fs.mkdirSync(dirCursor)
                }
            }
            dirCursor += '/'
        })
    }

    rightnow() {
        var now = new Date(Date.now())
        var filename = now.toISOString().split('T')[0] + '.log'
        var path = this.dir + '/' + filename
        var time = now.toTimeString().split(' ')
        return {
            path: path,
            time: time[0] + ' ' + time[1]
        }
    }

    info(title, msg) {
        this.log(title, msg, 'INFO')
    }

    err(title, msg) {
        this.log(title, msg, 'ERROR')
    }

    log(title, msg, level) {
        var now = this.rightnow()
        var line = cfg.name + '  [' + now.time + '] - [' + level + '] - ' + title + ' | ' + msg + '\n'

        this.ensureExistDir(this.dir)

        if (fs.existsSync(now.path)) {
            fs.appendFileSync(now.path, line)
        } else {
            fs.writeFile(now.path, line, (err) => {
                if (err) throw err
            })
        }
    }
}

module.exports = Logger

