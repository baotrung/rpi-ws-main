var cfg = require('../config/conf.json');
var jwt = require('jsonwebtoken');
var err = require('../resources/apiErrCodes.json');
var bcrypt = require('bcrypt');

function verifyToken(req,res,next){
    //console.log("DEBUG: service authenticate.auth()");
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,cfg.secret,(err,decoded) => {
            if(err){
                return res.json({
                    result: null,
                    err: err.ERR_AUTHENTICATION_TOKEN
                });
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.json({
            result: null,
            err: err.ERR_AUTHENTICATION_TOKEN
        });
    }
}

function verifypwd(pwd,user){
    if(bcrypt.compareSync(pwd,user.userPwd)){
        var payload = {
            username: user.userName
        }
        var expiresIn = 1440; 
        var token = jwt.sign(payload,cfg.secret,{
            expiresIn: expiresIn // 1440 minute = 24 hours
        });
        return{
            result: {
                token: token,
                expiresIn: expiresIn
            }
        };
    }else{
        return{
            "result": null,
            "err" : err.ERR_AUTHENTICATION_LOGIN
        };
    }
}

module.exports = {
    verifyToken: verifyToken,
    verifypwd: verifypwd
}