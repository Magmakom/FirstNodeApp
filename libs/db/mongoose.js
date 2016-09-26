var mongoose = require('mongoose');
var log = require('../log')(module);
var config = require('../config');
var utils = require('../utils');

mongoose.connect(config.get('mongoose:uri'));

var db = mongoose.connection;

db.on('error', function(err) {
    log.error('Connection error:', err.message);
});

db.once('open', function callback() {
    log.info("Connected to DB!");
    utils.initAdmin();
});

module.exports = mongoose;
