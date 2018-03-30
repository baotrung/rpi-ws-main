/**
 * this is a middleware
 */

var _ = require('underscore')
var pStructs = require('../config/reqParamsStruct.json')
var err = require('../resources/apiErrCodes.json')


module.exports = function verifyparams(req,res,next){
    //console.log("DEBUB: (service) verifyParams.verifyParams")
    var pStruct = pStructs[req.route.path]
    if(verifydata(req.body,pStruct)){
        next()
    }else{
        res.json({
            result: null,
            err: err.ERR_PARAMS
        })
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