var mongoose = require('./libs/db/mongoose');
var config = require('./libs/config');
var log = require('./libs/log')(module);
var bodyParser = require('body-parser');
var passport = require('passport');
var path = require('path');
var express = require('express');

var app = express();

app.use(passport.initialize());
app.use(express.static(path.join(__dirname, config.get('client'))));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

require('./routes')(app);

app.listen(process.env.PORT || config.get('port'), function() {
    log.info('Environment= '.env);
    log.info('Running on port ' + config.get('port') + '!');
});

exports = module.exports = app;
