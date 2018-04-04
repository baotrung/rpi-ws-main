var cfg = require('../config/conf.json')
var jwt = require('jsonwebtoken')
var e = require('../resources/apiErrCodes.json')
var bcrypt = require('bcrypt')
var db = require('./database')
var _ = require('underscore')
var Logger = require('./logger')
var logger = new Logger('ws')



module.exports = {
    verifyToken: verifyToken, //middleware
    verifypwd: verifypwd,
    verifyparams: verifyparams, //middleware
}

//middleware
function verifyToken(req,res,next){
    var token = req.headers['x-access-token']
    if(token){
        jwt.verify(token,cfg.secret,(err,decoded) => {
            if(err){
                logger.err(req.method + ' - ' + req.originalUrl, 'token: ' + token + ' | token invalid')
                logger.info(req.method + ' - ' + req.originalUrl, 'END')
                return res.json({
                    result: null,
                    err: e.ERR_AUTHENTICATION_TOKEN
                })
            }else{
                req.decoded = decoded
                next()
            }
        })
    }else{
        logger.err(req.method + ' - ' + req.originalUrl, "token missing")
        logger.info(req.method + ' - ' + req.originalUrl, 'END')
        return res.json({
            result: null,
            err: e.ERR_AUTHENTICATION_TOKEN
        })
    }
}

function verifypwd(pwd,user){
    if(bcrypt.compareSync(pwd,user.userPwd)){
        var payload = {
            username: user.userName
        }
        var expiresIn = 1440
        var token = jwt.sign(payload,cfg.secret,{
            expiresIn: expiresIn // 1440 minute = 24 hours
        })
        db.setToken(user.userName,token)

        return true
    }else{
        return false
    }
}


function verifyparams(req,res,next){
    var pStruct = require('../config/reqParamsStruct.json')[req.originalUrl]
    if(verifydata(req.body,pStruct)){
        next()
    }else{
        res.json({
            result: null,
            err: e.ERR_PARAMS
        })
        logger.info(req.method +' - ' + req.originalUrl, 'END')
    }
}


// verify if data has correct structure
function verifydata(data, structure) {
    var res = true
    _.each(structure, function (val, key) {
        switch (typeof val) {
        case "string":
            if (typeof data[key] !== val || typeof data[key] === 'undefined') {
                res = false
                //console.log(key+": format error : " + res)
            }
            break
        case "object":
            if (typeof data[key] === 'object') {
                if (val instanceof Array && data[key] instanceof Array) {
                    if(!verifydataArray(data[key],val)){
                        res = false
                    }
                } else if (!(val instanceof Array) && !(data[key] instanceof Array)) {
                    if(!verifydata(data[key], val)){
                        res = false
                    }
                } else {
                    res = false
                }
            } else {
                res = false
            }
            break
        }
    })

    return res
}

function verifydataArray(arr, structure) {
    var res2 = true
    // if (arr.length <= 0) {
    //     return false
    // }
    switch (typeof structure[0]) {
    case 'string':
        if(!_.all(arr, function (val) {return (typeof val === structure[0])})){
            res2 = false
        }
        break
    case 'object':
        if (_.all(arr,function(val){return(typeof val === 'object')})) {
            if (structure[0] instanceof Array && _.all(arr,function(val2){return(val2 instanceof Array)})) {
                _.each(arr,function(item){
                    if(!verifydataArray(item,structure[0])){
                        res2 = false
                    }
                })
            } else if (!(structure[0] instanceof Array) && _.all(arr,function(val3){return(!(val3 instanceof Array))})) {
                _.each(arr,function(item){
                    if(!verifydata(item,structure[0])){
                        res2 = false
                    }
                })
            } else {
                res2 = false
            }
        } else {
            res2 = false
        }
        break
    }

    return res2
}

//exemple structure params

// $struct = {
//     str: "string",
//     int: "number",
//     arr: ["string"],
//     arrObj:[
//         {
//             str2: "string",
//             bool: "boolean"
//         }
//     ],
//     obj:{
//         int2: "number"
//     }
// }