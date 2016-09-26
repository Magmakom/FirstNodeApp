var User = require('../model/user');
var config = require('./config');
var log = require('./log')(module);

function initAdmin() {
    var user = new User({
        email: config.get('admin:email'),
        password: config.get('admin:password'),
        lastName: config.get('admin:lastName'),
        role: 'admin',
        status: 'approved'
    });
    user.save(function(err) {
        if (err) {
            log.error('%s %s', err.name, err.message);
            return;
        }
        log.info('Default Admin created\nEmail: ' + user.email + '\nPassword: ' + user.password);
    })
}

exports.initAdmin = initAdmin;
