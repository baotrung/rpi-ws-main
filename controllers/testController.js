var router = require('express')()
//var firewall = require('../app/firewall').global
var Logger = require('../app/logger')
var _ = require('underscore')
var db = require('../app/database')
var e = require('../resources/apiErrCodes.json')
var utils = require('../app/utils')
var rp = require('request-promise')

var logger = new Logger('test')

router.post('/test-01', (req,res) => {
    db.updateStt("user-1")
    .then(
        data => {
            res.send(data)
        }
    ).catch(
        err => {
            res.send(err)
        }
    )
})

module.exports = router