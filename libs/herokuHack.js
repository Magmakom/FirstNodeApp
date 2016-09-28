var config = require('./config');
var log = require('./log')(module);
var http = require('http');
var https = require('https');

function callApp() {
    setInterval(function() {
        if (process.env.NODE_ENV === 'production') https.get(config.get('domain'), function(res) {});
        if (process.env.NODE_ENV === 'development') http.get(config.get('domain'), function(res) {});
    }, 300000); // every 5 minutes (300000)
}

exports.callApp = callApp;
