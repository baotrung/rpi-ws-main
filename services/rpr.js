var rList = require('../config/RPR.json');
var _ = require('underscore');

module.exports = function(req,res,next){
    var params = req.body;
    var rParams = rList[req.route.path];
    _.each(rParams, (val,key) => {
        //TODO: cerify params require
    });
}