var router = require('express')()
//var firewall = require('../app/firewall').global
var Logger = require('../app/logger')
//var _ = require('underscore')
var db = require('../app/database')
var e = require('../resources/apiErrCodes.json')
var utils = require('../app/utils')


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
            },
            err => {
                throw (err)
            }
        ).catch(err => {
            logger.err('GET - ' + req.originalUrl, err.stack)
            res.send({
                result: null,
                err: e.ERR_INTERNAL
            })
        }).then( () =>{
            logger.info('GET - ' + req.originalUrl, 'END')
        })
})

// router.post('/remote/light', verifyParams, (req, res) => {
//     //TODO:
//     db.setLight(req.body.id, req.body.status)
//         .then(
//             rows => {
//                 //console.log(rows.affectedRows)
//             },
//             err => {
//                 //console.log(err)
//             }
//         )
//     res.send('ok')
// })


module.exports = router