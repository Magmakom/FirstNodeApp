var config = require('./config');
var log = require('./log')(module);
var http = require('http');

function callApp() {
    setInterval(function() {
        http.get(config.get('domain'), function(res){
        });
    }, 300000); // every 5 minutes (300000)
}

exports.callApp = callApp;
