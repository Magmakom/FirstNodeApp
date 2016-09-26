var User = require('../../model/user');
var config = require('../../libs/config');
var mailer = require('../../libs/mailer');
var log = require('../../libs/log')(module);
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
    return res.status(422).json(err);
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
            return res.json({
                success: false
            });
        }
        res.json({
            success: true,
            message: 'user ' + req.body.email + ' was created'
        });
        template = "signup";
        params = {
            "{!username}": user.name
        };
        mailer.sendMail(user.email, params, template, "Subj");
    })
};

exports.login = function(req, res) {
    var token = generateToken(req.user);
    res.json({
        success: true,
        message: 'Enjoy your token!',
        role: req.user.role,
        token: token
    });
};

exports.role = function(req, res) {
    token = req.body.token || req.query.token || req.headers['x-access-token'];
    User.findById(jwt.decode(token).id, 'email role status', function(err, user) {
        if (!user) return validationError;
        res.json({
            success: true,
            role: user.role,
            status: user.status
        });
    })
};

exports.users = function(req, res) {
    User.find({
        role: {
            '$ne': 'admin'
        }
    }, 'lastName firstName email city phoneOffice phoneCell role created status', function(err, users) {
        if (err) return res.status(500).send(err);
        userMap = {};
        users.forEach(function(user) {
            userMap[user._id] = user;
        });
        res.send(userMap);
    });
};

exports.user = function(req, res, next) {
    userId = req.params.id;
    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user.profile);
    });
};

exports.approve = function(req, res, next) {
    userId = req.body.id;
    status = req.body.status;

    User.findById(userId, 'email lastName firstName status', function(err, user) {
        if (err) return res.status(500).send(err);
        if (!user) return validationError;
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
            "{!loginLink}": config.get('domain') + '/#/login?token=' + generateToken(user)
        };
        if (template) mailer.sendMail(user.email, params, template, "Subj");
    });
}

exports.changePassword = function(req, res, next) {
    var userId = req.params.id;
    var oldPass = req.body.oldPassword;
    var newPass = req.body.newPassword;

    User.findById(userId, function(err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.status(200).send('OK');
            });
        } else {
            res.status(403).send('Forbidden');
        }
    });
};

function generateToken(user) {
    token = jwt.sign({
        id: user.id,
        role: user.role
    }, config.get('serverSecret'), {
        expiresIn: config.get('tokenLife')
    });
    return token;
}

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
