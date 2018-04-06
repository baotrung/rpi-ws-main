'use strict'
var mysql = require('mysql')
var cfg = require('../config/conf.json').database
var bcrypt = require('bcrypt')
var conn =  mysql.createConnection({
    host: cfg.host,
    user: cfg.user,
    password: cfg.password,
    database: cfg.dbname
})


function query(sql, args) {
    //console.log('sql = ' + sql)
    return new Promise((resolve, reject) => {
        conn.query(sql, args, (err, rows) => {
            if (err)
                return reject(err)
            resolve(rows)
        })
    })
}

function close() {
    return new Promise((resolve, reject) => {
        conn.end(err => {
            if (err)
                return reject(err)
            resolve()
        })
    })
}

function getAllSttStrict(username) {
    return new Promise((resolve, reject) => {
        getUserbyusername(username)
            .then(
                user => {
                    switch (user.userRole) {
                        case 'ADMIN':
                            return Promise.resolve('SELECT lo.id as locationId,lo.name as locationName, li.id as lightId, li.name as liName, li.status FROM LOCATIONS lo,LIGHTS li WHERE lo.id = li.location ORDER BY lo.id, li.id')
                            break
                        case 'USER':
                            return Promise.resolve('SELECT lo.id as locationId,lo.name as locationName, li.id as lightId, li.name as liName, li.status FROM LOCATIONS lo,LIGHTS li WHERE lo.id = li.location AND ( lo.access = 0 OR lo.access = 1 AND lo.id IN (SELECT la.locationId FROM LOC_ACCESS la WHERE la.userId = ' + user.userId + ')) ORDER BY lo.id, li.id')
                            break
                        default: // GUEST
                            return Promise.resolve('SELECT lo.id as locationId,lo.name as locationName, li.id as lightId, li.name as liName, li.status FROM LOCATIONS lo,LIGHTS li WHERE lo.id = li.location AND lo.access = 0 ORDER BY lo.id, li.id')
                            break
                    }
                }
            )
            .then(query)
            .then(rows => {
                var cpt = 0
                var result = []
                var locId = 0
                rows.forEach(element => {
                    if (locId != parseInt(element.locationId)) {
                        result.push({
                            'id': element.locationId,
                            'name': element.locationName,
                            'lights': []
                        })
                        locId = parseInt(element.locationId)
                    }
                    result[result.length - 1]['lights'].push({
                        'id': element.lightId,
                        'name': element.liName,
                        'status': element.status
                    })
                    cpt++
                    if (cpt === rows.length) {
                        resolve(result)
                    }
                })
            })
            .catch(
                err => {
                    reject(err)
                }
            )
    })
}

function getUserbyusername(username) {
    var sql = "SELECT * FROM USERS WHERE USERS.userName = '" + username + "' LIMIT 1"
    return new Promise((resolve, reject) => {
        query(sql)
            .then(
                rows => {
                    if (rows[0]) {
                        resolve(rows[0])
                    } else {
                        throw ('database error: user ' + username + ' not exist')
                    }
                }
            ).catch(
                err => {
                    reject(err)
                }
            )
    })
}



function setLight(data) {
    //console.log("data = " + data.status + " - " + data.id)
    var sql = "UPDATE LIGHTS SET status = " + data.status + " WHERE id = " + data.id
    return new Promise((resolve, reject) => {
        query(sql)
            .then(
                result => {
                    resolve(result)
                },
                err => {
                    reject(err)
                }
            )
    })
}

function setToken(username, token) {
    var sql = "UPDATE USERS SET userToken = '" + token + "' WHERE userName = '" + username + "'"
    return new Promise((resolve, reject) => {
        query(sql)
            .then(
                result => {
                    resolve(result)
                },
                err => {
                    reject(err)
                }
            )
    })
}

// function createUser(username, password, role = 'USER'){
//     var hash = bcrypt.hashSync(password,10)
//     var sql = "INSERT INTO USERS(userName,userPwd,userRole) VALUES('"+username+"','"+hash+"','"+role+"')"
//     return new Promise((resolve,reject) => {
//         query(sql)
//             .then(
//                 result => {
//                     resolve(result)
//                 },
//                 err => {
//                     reject(err)
//                 }
//             )
//     })
// }

// createUser('user-2','user')
// createUser('guest','user','GUEST')

function findUserByUserName(username) {
    var sql = "SELECT * FROM USERS WHERE userName = '" + username + "' LIMIT 1"
    return new Promise((resolve, reject) => {
        query(sql)
            .then(
                result => {
                    resolve(result)
                },
                err => {
                    reject(err)
                }
            )
    })
}

function getLightTarget(id) {
    var sql = "SELECT LIGHTS.pin, LOCATIONS.ip, LOCATIONS.port, LOCATIONS.id as locId FROM LIGHTS,LOCATIONS WHERE LOCATIONS.id = LIGHTS.location  AND LIGHTS.id = " + id + " LIMIT 1"
    return new Promise((resolve, reject) => {
        query(sql)
            .then(
                result => {
                    if(result[0]){
                        resolve(result[0])
                    }
                    else{
                        throw('database err: getLightTarget return 0 record')
                    }
                }
            )
            .catch(
                err =>{
                    reject(err)
                }
            )
    })
}

function checkAccess(data){
    var sql = "SELECT checkAccess("+data.locId+",'"+data.uname+"') as access"
    return new Promise((resolve,reject) => {
        query(sql)
        .then(
            rows => {
                if(rows[0]){
                    resolve(rows[0])
                }else{
                    throw('database error: function checkAccess return null :-o')
                }
            }
        )
        .catch(
            err =>{
                reject(err)
            }
        )
    })
}


function getTokenByUsername(username) {
    var sql = "SELECT userToken FROM USERS WHERE userName = '" + username + "' LIMIT 1"
    return new Promise((resolve, reject) => {
        query(sql)
            .then(rows => {
                if (rows[0]) {
                    resolve(rows[0])
                } else {
                    throw ('database error: user ' + username + ' not exist')
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = {
    getAllSttStrict:getAllSttStrict,
    setLight: setLight,
    findUserByUserName: findUserByUserName,
    setToken: setToken,
    getLightTarget: getLightTarget,
    getTokenByUsername: getTokenByUsername,
    checkAccess:checkAccess
}