var User   = require('../../model/user');
var config = require('../../libs/config');
var mailer = require('../../libs/mailer');
var auth   = require('../../libs/auth');
var log    = require('../../libs/log')(module);

var jwt    = require('jsonwebtoken');

function validationError(res, err, msg) {
    return res.status(422).json(msg || err);
};

exports.signup = function(req, res) {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        phoneCell: req.body.phoneCell,
        phoneOffice: req.body.phoneOffice,
        city: req.body.city,
        role: req.body.role,
        status: req.body.status
    });
    user.save(function(err) {
        if (err) {
            log.error('%s %s', err.name, err.message);
            return validationError(res, err, {
                message: 'User already exists'
            })
        }
        log.info('User ' + req.body.email + ' was created');
        res.json({
            success: true,
            message: 'User ' + req.body.email + ' was created'
        });
        template = "signup";
        params = {
            "{!username}": user.name
        };
        mailer.sendMail(user.email, params, template, "User stored");
    })
};

exports.login = function(req, res) {
    var token = auth.generateLoginToken(req.user);
    res.json({
        success: true,
        message: 'Enjoy your token!',
        role: req.user.role,
        token: token
    });
};

exports.role = function(req, res) {
    token = req.body.token || req.query.token || req.headers['x-access-token'];
    User
        .findById(jwt.decode(token).id, 'email role status')
        .exec(function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'Invalid session token'
                });
            }
            res.json({
                success: true,
                role: user.role,
                status: user.status
            });
        })
};

exports.users = function(req, res) {
    User
        .find({
            role: {
                '$ne': 'admin'
            }
        }, 'lastName firstName email city phoneOffice phoneCell role created status')
        .exec(function(err, users) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return res.status(500).send({
                    message: 'Database Internal Error'
                });
            }
            userMap = {};
            users.forEach(function(user) {
                userMap[user._id] = user;
            });
            res.send(userMap);
        });
};

exports.user = function(req, res, next) {
    userId = req.body.userId || req.query.userId || req.params.userId;
    User
        .findById(userId)
        .exec(function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'User not found'
                });
            }
            res.json(user.profile);
        });
};

exports.approve = function(req, res, next) {
    userId = req.body.id;
    status = req.body.status;

    User
        .findById(userId, 'email lastName firstName status')
        .exec(function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'User not found'
                });
            }
            user.status = status;
            user.save(function(err) {
                if (err) {
                    log.error('%s %s', err.name, err.message);
                    return validationError(res, err);
                }
                res.json({
                    success: true,
                });
            })
            var template;
            if (status === "approved") {
                template = "signup.approve";
            } else if (status === "rejected") {
                template = "signup.reject";
            }
            params = {
                "{!username}": user.name,
                "{!loginLink}": config.get('domain') +
                    '/#/login?token=' + auth.generateLoginToken(user)
            };
            if (template) mailer.sendMail(user.email, params, template, "User " + status);
        });
}

exports.changePassword = function(req, res, next) {
    var newPassword = req.body.newPassword || req.query.newPassword || req.params.newPassword;
    var oldPass = req.body.oldPass || req.query.oldPass || req.params.oldPass;
    var userId = req.body.userId || req.query.userId || req.params.userId;

    User
        .findById(userId)
        .exec(function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'User not found'
                });
            }
            if (user.authenticate(oldPass)) {
                user.password = newPass;
                user.save(function(err) {
                    if (err) {
                        log.error('%s %s', err.name, err.message);
                        return validationError(res, err);
                    }
                    res.json({
                        success: true
                    });
                });
            } else {
                res.status(403).send('Forbidden');
            }
        });
};

exports.resetPassword = function(req, res, next) {
    var email = req.body.email || req.query.email || req.params.email;
    User
        .findOne({
            'email': email
        }, 'lastName firstName email role')
        .exec(function(err, user) {
            if (err) log.error('%s %s', err.name, err.message);
            if (err || !user) {
                return validationError(res, err, {
                    message: 'Email not found'
                });
            }
            res.json({
                success: true
            });
            template = "change-password";
            params = {
                "{!username}": user.name,
                "{!passwordLink}": config.get('domain') +
                    '/#/password?token=' + auth.generateResetToken(user)
            };
            mailer.sendMail(user.email, params, template, "Reset Password");
        })
}

exports.newPassword = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var email = jwt.decode(token).email;
    var newPassword = req.body.newPassword || req.query.newPassword || req.params.newPassword;
    log.info('token=' + token);
    log.info('email=' + email);

    User
        .findOne({
            'email': email
        })
        .exec(function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'Email not found'
                });
            }
            user.password = newPassword;
            user.save(function(err) {
                if (err) {
                    log.error('%s %s', err.name, err.message);
                    return validationError(res, err);
                }
                res.json({
                    success: true,
                    toke: auth.generateLoginToken(user)
                });
            });
        });
};

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
