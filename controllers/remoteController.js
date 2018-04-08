var router = require('express')()
//var firewall = require('../app/firewall').global
var Logger = require('../app/logger')
var _ = require('underscore')
var db = require('../app/database')
var e = require('../resources/apiErrCodes.json')
var utils = require('../app/utils')
var rp = require('request-promise')


var logger = new Logger('ws')

//router.use('/', firewall)

router.use('/', utils.verifyToken)

router.get('/init', (req, res) => {
    //console.log(req.decoded)
    db.updateStt(req.decoded.username)
        .then(
            rows => {
                res.send({
                    'result': rows,
                    'err': null
                })
            }
        ).catch(err => {
            logger.err('GET - ' + req.originalUrl, err.stack)
            res.send({
                result: null,
                err: e.ERR_INTERNAL
            })
        }).then(() => {
            logger.info('GET - ' + req.originalUrl, 'END')
        })
})

router.post('/light', utils.verifyparams, (req, res) => {
    var resData = {
        result: null,
        err: null
    }
    var target={}
    db.getLightTarget(req.body.lightId)
        .then(
            data =>{
                target = data;
                data.uname = req.decoded.username
                return Promise.resolve(data)
            }
        )
        .then(db.checkAccess)
        .then(
            result => {
                if (result.access == 1) { // access granted
                    var uri = 'http://' + target.ip + ':' + target.port + '/light/set'
                    return Promise.resolve({
                        method: 'POST',
                        uri: uri,
                        body: {
                            id: req.body.lightId,
                            pin: target.pin,
                            status: req.body.lightStt
                        },
                        json: true // Automatically stringifies the body to JSON
                    })
                }else{
                    // throw({
                    //     name: 'ERR_ACCESS_DENIED',
                    //     message: 'error: user \''+req.decoded.username+'\' has no access in this location'
                    // })
                    var customErr = new Error()
                    customErr.name = 'ERR_ACCESS_DENIED'
                    customErr.message = 'error: user \''+req.decoded.username+'\' has no access in this location'
                    throw(customErr)
                }
            }
        )
        .then(rp)
        .then(data => {
            resData.result = {
                lightId: data.id,
                lightStt: data.status
            }
            return Promise.resolve(data)
        })
        .then(db.setLight)
        .then(data => {
            res.json(resData)
        })
        .catch(err => {
            logger.err('POST - ' + req.originalUrl, err)
            switch(err.name){
                case 'ERR_ACCESS_DENIED':
                res.json({
                    result:null,
                    err: e.ERR_ACCESS_DENIED
                })
                break
                default:
                res.json({
                    result: null,
                    err: e.ERR_INTERNAL
                })
                break
            }
        }).then(
            () => {
                logger.info('POST - ' + req.originalUrl, 'END')
            }
        )
})


module.exports = router