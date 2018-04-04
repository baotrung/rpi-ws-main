var router = require('express')()
//var firewall = require('../app/firewall').global
var Logger = require('../app/logger')
//var _ = require('underscore')
var db = require('../app/database')
var e = require('../resources/apiErrCodes.json')
var utils = require('../app/utils')
var rp = require('request-promise')


var logger = new Logger('ws')

//router.use('/', firewall)

router.use('/', utils.verifyToken)

router.get('/init', (req, res) => {
    db.getAllStt()
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
    db.getLightTarget(req.body.lightId)
        .then(
            result => {
                if (result) {
                    var uri = 'http://' + result.ip + ':' + result.port + '/light/set'
                    return Promise.resolve({
                        method: 'POST',
                        uri: uri,
                        body: {
                            id: req.body.lightId,
                            pin: result.pin,
                            status: req.body.lightStt
                        },
                        json: true // Automatically stringifies the body to JSON
                    })
                }else{
                    return Promise.reject("database error: record not exist")
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
            //console.log(err)
            res.json({
                result: null,
                err: e.ERR_INTERNAL
            })
        }).then(
            () => {
                logger.info('POST - ' + req.originalUrl, 'END')
            }
        )
})


module.exports = router