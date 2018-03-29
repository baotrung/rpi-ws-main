var router = require('express')();
var firewall = require('../services/firewall').global;
var rp = require('request-promise');
var logger = require('../services/logger');
var cfg = require('../config/conf.json');
var _ = require('underscore');
var db = require('../services/database');
var err = require('../resources/apiErrCodes.json');
var auth = require('../services/authenticate');
var verifyParams = require('../services/verifyParams');
var Logger = require('../services/logger.1');

var apiLog = new Logger('restapi');

router.use('/', firewall);
router.use('/remote',auth.verifyToken);

router.post('/auth', verifyParams ,(req,res) => {
    db.findUserByUserName(req.body.username)
    .then(
        result => {
            if(result.length > 0){
                res.json(auth.verifypwd(req.body.password,result[0]));
            }else{
                res.json({
                    "result": null,
                    "err" : err.ERR_AUTHENTICATION_LOGIN
                })
            }
        },
        err => {
            res.json({
                "result": null,
                "err" : err.ERR_INTERNAL
            })
        }
    );
})


router.get('/remote/check',(req, res) => {
    logger.info('REQUEST', 'type: GET; url: "/remote/check";');
    res.send('ok');
});

router.get('/remote/init', (req, res) => {
    console.log(req.route.path);
    db.getAllStt()
        .then(
            rows => {
                res.send({
                    "result": rows,
                    "err": null
                });
            },
            err => {
                throw (err);
            }
        ).catch(err => {
            logger.err("GET REQUEST - init", err.code);
            logger.log("GET REQUEST - init",err,"DEBUG");
            res.send({
                "result": null,
                "err" : {
                    "code" : 1,
                    "msg": "internal error"
                }
            });
        });
});

router.post('/remote/light',verifyParams, (req,res) => {
    //TODO:
    db.setLight(req.body.id,req.body.status)
    .then(
        rows => {
            console.log(rows.affectedRows);
        },
        err => {
            console.log(err);
        }
    );
    res.send('ok');
});


module.exports = router;