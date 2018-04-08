var express = require('express')
var router = express()
var remoteController = require('../controllers/remoteController')
var authController = require('../controllers/authController')
var testController = require('../controllers/testController')
var _ = require('underscore')

var Logger = require('../app/logger')
var logger = new Logger('ws')

module.exports = router

router.use('/', (req,res,next) => {
    var body = ''
    var params = ''
    var headers = ''
    if(req.body){
        _.each(req.body,(item,index) => {
            if(!index.includes('password')){
                body += index + ': '+item+'; '
            }
        })
    }
    if(req.params){
        _.each(req.params,(item,index) => {
            params += index + ': '+item+'; '
        })
    }
    if(req.headers){
        _.each(req.headers,(item,index) => {
            headers += index + ': '+item+'; '
        })
    }

    logger.info(req.method + ' - ' + req.originalUrl,'@headers(' + headers + ')@params('+ params +') - ' + '@body('+ body +') | BEGIN')

    next()
})

router.use('/auth',authController)
router.use('/remote',remoteController)
router.use('/test', testController)