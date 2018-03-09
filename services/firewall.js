var AccessControl  = require('express-ip-access-control');
var fwcfg = require('../config/firewall.conf.json');
var logger = require('./logger');

var globalRules = fwcfg.global;

globalRules.log = function(ip, access) {
    logger.info('FIREWALL', 'rule: global; ip: '+ ip +'; access: ' + (access ? 'granted' : 'denied') + ';');
},

module.exports = {
    global: AccessControl(globalRules)
};