var express = require('express')
var router = express()
var remoteController = require('../controllers/remoteController')
var authController = require('../controllers/authController')

var Logger = require('../app/logger')
var logger = new Logger('ws')

module.exports = router

router.use('/', (req,res,next) => {
    logger.info(req.method + ' - ' + req.originalUrl, 'BEGIN')
    next()
})

router.use('/auth',authController)
router.use('/remote',remoteController)