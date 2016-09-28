var mongoose = require('./libs/db/mongoose');
var config   = require('./libs/config');
var log      = require('./libs/log')(module);
var hack     = require('./libs/herokuHack');

var bodyParser = require('body-parser');
var passport   = require('passport');
var path       = require('path');
var express    = require('express');

var app = express();

app.use(passport.initialize());
app.use(express.static(path.join(__dirname, config.get('client'))));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./routes')(app);

app.listen(process.env.PORT || config.get('port'), function() {
    log.info('Environment = ' + process.env.NODE_ENV);
    log.info('Running on port ' + (process.env.PORT || config.get('port')));
});

hack.callApp();

exports = module.exports = app;
