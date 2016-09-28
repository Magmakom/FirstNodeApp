var User = require('../model/user');
var config = require('./config');
var log = require('./log')(module);

function initAdmin() {
    User
        .findOne({
            'email': config.get('admin:email')
        }, function(err, user) {
            if (!user) {
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
                    log.info('Default Admin created [Email: ' + user.email + '] [Password: ' + user.password + ']');
                })
            } else {
                log.info('Default Admin already exists [Email: ' + user.email + ']');
            }
        });
}

exports.initAdmin = initAdmin;
