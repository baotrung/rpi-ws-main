'use strict'
var mysql = require('mysql')
var bcrypt = require('bcrypt')
var cfg = require('../config/conf.json').database

class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: cfg.host,
            user: cfg.user,
            password: cfg.password,
            database: cfg.dbname
        })
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err)
                resolve(rows)
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err)
                resolve()
            })
        })
    }
}

var db = new Database()

function getAllStt() {
    //console.log("debug getAllStt()")
    return new Promise((resolve, reject) => {
        db.query('SELECT lo.id as locationId,lo.name as locationName, li.id as lightId, li.name as liName, li.status FROM LOCATIONS lo,LIGHTS li WHERE lo.id = li.location ORDER BY lo.id')
            .then(rows => {
                    //console.log("querry success")
                    //console.log(rows)
                    var cpt = 0
                    var result = []
                    var locId = 0
                    rows.forEach(element => {
                       if(locId != parseInt(element.locationId)){
                           result.push({
                                "id": element.locationId,
                                "name": element.locationName,
                                "lights": []
                           })
                           locId = parseInt(element.locationId)
                       }
                       result[result.length -1]['lights'].push({
                            "id": element.lightId,
                            "name": element.liName,
                            "status": element.status
                       })
                       cpt++
                        if (cpt === rows.length) {
                            resolve(result)
                        }
                    })
                },
                err => {
                    reject(err)
                })
    })
}

function setLight(id,stt){
    var sql = "UPDATE LIGHTS SET status = " + stt + " WHERE id = " + id

    return new Promise((resolve,reject) => {
        db.query(sql)
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

function setToken(username,token){
    var sql = "UPDATE USERS SET userToken = '" + token + "' WHERE userName = '" + username +"'"

    return new Promise((resolve,reject) => {
        db.query(sql)
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

function createUser(username, password, role = "USER"){
    var hash = bcrypt.hashSync(password,10)
    var sql = "INSERT INTO USERS(userName,userPwd,userRole) VALUES('"+username+"','"+hash+"','"+role+"')"
    return new Promise((resolve,reject) => {
        db.query(sql)
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

function findUserByUserName(username){
    var sql = "SELECT * FROM USERS WHERE userName = '" + username + "' LIMIT 1"
    return new Promise((resolve,reject) => {
        db.query(sql)
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

module.exports = {
    getAllStt: getAllStt,
    setLight: setLight,
    findUserByUserName: findUserByUserName,
    setToken:setToken
}