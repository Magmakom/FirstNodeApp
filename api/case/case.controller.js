var User    = require('../../model/user');
var Case    = require('../../model/case');
var Counter = require('../../model/counter');
var config  = require('../../libs/config');
var mailer  = require('../../libs/mailer');
var log     = require('../../libs/log')(module);

var jwt     = require('jsonwebtoken');

function validationError(res, err, msg) {
    return res.status(422).send(msg || err);
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

exports.cases = function(req, res) {
    Case
        .find({})
        .populate('_creator')
        .exec(function(err, cases) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return res.status(500).send({
                    message: 'Database Internal Error'
                });
            }
            casesMap = {};
            cases.forEach(function(caseItem) {
                casesMap[caseItem._id] = {
                    "_id": caseItem._id,
                    "number": caseItem.number,
                    "name": caseItem.name,
                    "body": caseItem.body,
                    "status": caseItem.status,
                    "created": caseItem.created,
                    "userId": caseItem._creator._id,
                    "userName": caseItem._creator.name
                };
            });
            res.send(casesMap);
        });
};

exports.userCases = function(req, res) {
    var token = req.query.token || req.headers['x-access-token'];
    var userId = jwt.decode(token).role === "user" ? jwt.decode(token).id : (req.body.userId || req.query.userId || req.params.userId);
    Case
        .find({
            '_creator': userId
        })
        .exec(function(err, cases) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'User has no cases'
                });
            }
            if (!cases || cases.length===0) return validationError(res, err, {
                message: 'User has no cases'
            });
            casesMap = {};
            cases.forEach(function(caseItem) {
                casesMap[caseItem._id] = {
                    "_id": caseItem._id,
                    "number": caseItem.number,
                    "name": caseItem.name,
                    "body": caseItem.body,
                    "status": caseItem.status,
                    "created": caseItem.created
                };
            });
            res.send(casesMap);
        });
}

exports.add = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var currentCaseCount = 0;
    Counter
        .count({})
        .exec(function(err, count) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return res.status(500).send({
                    message: 'Database Internal Error'
                });
            }
            if (count === 0) {
                var newCounter = new Counter({
                    caseCount: 1
                });
                newCounter.save();
            }
        });
    Counter.findOneAndUpdate({}, {
            $inc: {
                caseCount: 1
            }
        },
        function(err, counter) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return res.status(500).send({
                    message: 'Database Internal Error'
                });
            }
            if (counter) currentCaseCount = counter.caseCount;
            User
                .findById(jwt.decode(token).id)
                .exec(function(err, user) {
                    if (err) {
                        log.error('%s %s', err.name, err.message);
                        return validationError(res, err, {
                            message: 'Invalid session token'
                        });
                    }
                    var caseItem = new Case({
                        _creator: user._id,
                        number: pad(currentCaseCount, 10),
                        name: req.body.name,
                        body: req.body.body
                    });
                    caseItem.save(function(err) {
                        if (err) {
                            log.error('%s %s %s', err.name, err.message);
                            return validationError(res, err, {
                                message: 'Unprocessable Case Entity'
                            });
                        }
                        res.json({
                            success: true
                        });
                        template = "case";
                        params = {
                            "{!username}": user.name,
                            "{!casetype}": caseItem.name,
                            "{!casenumber}": caseItem.number
                        };
                        mailer.sendMail(user.email, params, template, "Case stored");
                    });
                    user.cases.push(caseItem);
                    user.save();
                });
        }
    )
};

exports.approve = function(req, res, next) {
    caseId = req.body.id;
    status = req.body.status;

    Case
        .findByIdAndUpdate(caseId, {
            $set: {
                "status": status
            }
        }, {
            upsert: true
        })
        .populate('_creator', 'name email')
        .exec(function(err, caseItem) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return validationError(res, err, {
                    message: 'Unprocessable Case Entity'
                });
            }
            res.json({
                success: true
            });
            var template;
            if (status === "approved") {
                template = "case.approve";
            } else if (status === "rejected") {
                template = "case.reject";
            }
            params = {
                "{!username}": caseItem._creator.name,
                "{!casetype}": caseItem.name,
                "{!casenumber}": caseItem.number
            };
            if (template) mailer.sendMail(caseItem._creator.email, params, template, "Case " + status);
        });
};

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
