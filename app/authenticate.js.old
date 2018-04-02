var cfg = require('../config/conf.json')
var jwt = require('jsonwebtoken')
var e = require('../resources/apiErrCodes.json')
var bcrypt = require('bcrypt')
var db = require('./database')

//middleware
function verifyToken(req,res,next){
    var token = req.headers['x-access-token']
    if(token){
        jwt.verify(token,cfg.secret,(err,decoded) => {
            if(err){
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

module.exports = {
    verifyToken: verifyToken,
    verifypwd: verifypwd
}