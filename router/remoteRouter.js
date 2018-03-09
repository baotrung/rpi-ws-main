var router = require('express')();
var firewall = require('../services/firewall').global;
var rp = require('request-promise');
var logger = require('../services/logger');
var cfg = require('../config/conf.json');
var _ = require('underscore');

router.use('/remote', firewall);

router.get('/remote/check', function (req, res) {
    logger.info('REQUEST', 'type: GET; url: "/remote/check";');
    res.send('ok');
});

router.get('/remote/init', function (req, res) {
    logger.info('REQUEST', 'type: GET; url: "/remote/init";');

    var $data = {
        'd': null,
        'e': null
    };

    var promises = [];

    _.each(cfg.locations, (location) => {
        promises.push(new Promise (function (resolve,reject) {
            var options = {
                uri: 'http://'+location.host+':'+location.port+'/remote/check',
                qs: {
                    access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options).then(function (data) {
                return resolve(data);
            }).catch(function (err) {
                return reject(err);
            });
        }));
    });

    Promise.all(promises).then((datas) => {
        res.send(datas);
    }).catch((error) => {
        res.send(error);
    });

});



module.exports = router;