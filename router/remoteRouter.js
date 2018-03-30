var router = require('express')()
var firewall = require('../services/firewall').global
var rp = require('request-promise')
var Logger = require('../services/logger')
var cfg = require('../config/conf.json')
var _ = require('underscore')
var db = require('../services/database')
var e = require('../resources/apiErrCodes.json')
var auth = require('../services/authenticate')
var verifyParams = require('../services/verifyParams')
var jwt = require('jsonwebtoken')

var logger = new Logger('ws-remote');

router.use('/', firewall)
router.use('/remote', auth.verifyToken)

router.post('/auth', verifyParams, (req, res) => {
    logger.info('POST - authentication', 'username:' + req.body.username + ' | BEGIN')
    db.findUserByUserName(req.body.username)
        .then(
            result => {
                if (result.length > 0) {
                    if (auth.verifypwd(req.body.password, result[0])) {
                        var payload = {
                            username: req.body.username
                        }
                        var token = jwt.sign(payload, cfg.secret, {
                            expiresIn: cfg.ws.expired // 1440 minute = 24 hours
                        })

                        db.setToken(req.body.username, token)

                        logger.info('POST - authentication', 'username:' + req.body.username + ' | success')

                        res.json({
                            result: {
                                token: token,
                                expiresIn: cfg.ws.expired
                            },
                            err: null
                        })
                    }else{
                        logger.err('POST - authentication', 'username:' + req.body.username + ' | password not match')
                        res.json({
                                result: null,
                                err : e.ERR_AUTHENTICATION_LOGIN
                        })
                    }
                } else {
                    logger.err('POST - authentication', 'username:' + req.body.username + ' | user not found')
                    res.json({
                        "result": null,
                        "err": e.ERR_AUTHENTICATION_LOGIN
                    })
                }
            },
            err => {
                logger.err('POST - authentication', 'username:' + req.body.username + ' | ' + err.stack)
                res.json({
                    "result": null,
                    "err": e.ERR_INTERNAL
                })
            }
        ).then( () => {
            logger.info('POST - authentication', 'username:' + req.body.username + ' | END')
        })
})

router.get('/remote/init', (req, res) => {
    logger.info("GET - init", ' | BEGIN')
    db.getAllStt()
        .then(
            rows => {
                res.send({
                    "result": rows,
                    "err": null
                })
            },
            err => {
                throw (err)
            }
        ).catch(err => {
            logger.err("GET - init", e.code)
            logger.log("GET - init", err.stack, "DEBUG")
            res.send({
                "result": null,
                "err": {
                    "code": 1,
                    "msg": "internal error"
                }
            })
        })
})

router.post('/remote/light', verifyParams, (req, res) => {
    //TODO:
    db.setLight(req.body.id, req.body.status)
        .then(
            rows => {
                console.log(rows.affectedRows)
            },
            err => {
                console.log(err)
            }
        )
    res.send('ok')
})


module.exports = router