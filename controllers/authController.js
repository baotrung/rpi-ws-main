var cfg = require('../config/conf.json')
var e = require('../resources/apiErrCodes.json')

var jwt = require('jsonwebtoken')
var express = require('express')
var router = express()

var db = require('../app/database')
var utils = require('../app/utils')

var Logger = require('../app/logger')
var logger = new Logger('ws')

module.exports = router
router.post('',utils.verifyparams, (req, res) => {
    logger.info('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | BEGIN')
    db.findUserByUserName(req.body.username)
        .then(
            result => {
                if (result.length > 0) {
                    if (utils.verifypwd(req.body.password, result[0])) {
                        var payload = {
                            username: req.body.username
                        }
                        var token = jwt.sign(payload, cfg.secret, {
                            expiresIn: cfg.ws.expired // 1440 minute = 24 hours
                        })

                        db.setToken(req.body.username, token)

                        logger.info('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | success')

                        res.json({
                            result: {
                                token: token,
                                expiresIn: cfg.ws.expired
                            },
                            err: null
                        })
                    }else{
                        logger.err('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | password not match')
                        res.json({
                            result: null,
                            err : e.ERR_AUTHENTICATION_LOGIN
                        })
                    }
                } else {
                    logger.err('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | user not found')
                    res.json({
                        result: null,
                        err: e.ERR_AUTHENTICATION_LOGIN
                    })
                }
            },
            err => {
                logger.err('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | ' + err.stack)
                res.json({
                    result: null,
                    err: e.ERR_INTERNAL
                })
            }
        ).then( () => {
            logger.info('POST - ' + req.originalUrl, 'username:' + req.body.username + ' | END')
        })
})