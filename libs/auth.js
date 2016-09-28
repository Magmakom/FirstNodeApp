var mongoose = require('../libs/db/mongoose');
var User = require('../model/user');
var config = require('./config');
var bodyParser = require('body-parser');
var compose = require('composable-middleware');
var log = require('./log')(module);
var jwt = require('jsonwebtoken');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var validationError = function(res, err) {
    return res.status(422).json(err);
};

passport.use(new LocalStrategy({
        usernameField: 'email',
    },
    function(username, password, done) {
        User.findOne({
            email: username,
            status: 'approved'
        }, 'email role hashedPassword salt', function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect email.'
                });
            }
            if (!user.checkPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function isAuthenticated() {
    return compose()
        .use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                jwt.verify(token, config.get('serverSecret'), function(err, decoded) {
                    if (err) {
                        res.status(403).send('Forbidden');
                    } else {
                        req.decoded = decoded;
                        next();
                    }
                });
            } else {
                return res.status(403).send('Forbidden');
            }
        })
}

function isApproved() {
    return compose()
        .use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                User.findById(jwt.decode(token).id, 'name status', function(err, user) {
                    if (err) return res.status(403).send('Forbidden');
                    if (!user) return validationError;
                    if (user.status === 'approved') {
                        next();
                    } else {
                        if (!user) return res.status(401).send('Unauthorized');
                    }
                });
            }
        })
}

function isAdmin() {
    return compose()
        .use(function(req, res, next) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];
            if (token) {
                User.findById(jwt.decode(token).id, 'name role', function(err, user) {
                    if (err) return res.status(403).send('Forbidden');
                    if (!user) return validationError;
                    if (user.role === 'admin') {
                        next();
                    } else {
                        if (!user) return res.status(401).send('Unauthorized');
                    }
                });
            }
        })
}

function generateLoginToken(user) {
    token = jwt.sign({
        id: user.id,
        role: user.role
    }, config.get('serverSecret'), {
        expiresIn: config.get('tokenLoginLife')
    });
    return token;
}

function generateResetToken(user) {
    token = jwt.sign({
        email: user.email,
        role: user.role
    }, config.get('serverSecret'), {
        expiresIn: config.get('tokenResetLife')
    });
    return token;
}

exports.generateResetToken = generateResetToken;
exports.generateLoginToken = generateLoginToken;
exports.isAuthenticated = isAuthenticated;
exports.isApproved = isApproved;
exports.isAdmin = isAdmin;
