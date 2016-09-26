var User = require('../../model/user');
var Counter = require('../../model/counter');
var config = require('../../libs/config');
var mailer = require('../../libs/mailer');
var log = require('../../libs/log')(module);
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
    return res.status(422).json(err);
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

exports.cases = function(req, res) {
    User.find({}, 'lastName firstName status cases', function(err, users) {
        if (err) return res.status(500).send(err);
        casesMap = {};
        users.forEach(function(user) {
            user.cases.forEach(function(caseItem) {
                casesMap[caseItem._id] = {
                    "_id": caseItem._id,
                    "number": caseItem.number,
                    "name": caseItem.name,
                    "body": caseItem.body,
                    "status": caseItem.status,
                    "userId": user.id,
                    "userName": user.name
                };
            });
        });
        res.send(casesMap);
    });
};

exports.add = function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var currentCaseCount = 0;
    Counter.count({}, function(err, count) {
        if (!err && count === 0) {
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
            if (err) log.error('%s %s', err.name, err.message);
            if (counter) currentCaseCount = counter.caseCount;
            User.findByIdAndUpdate(
                jwt.decode(token).id, {
                    $push: {
                        "cases": {
                            number: pad(currentCaseCount, 10),
                            name: req.body.name,
                            body: req.body.body
                        }
                    }
                }, {
                    safe: true,
                    upsert: true
                },
                function(err, user) {
                    if (err) {
                        log.error('%s %s', err.name, err.message);
                        return res.json({
                            success: false
                        });
                    }
                    res.json({
                        success: true
                    });
                    template = "case";
                    params = {
                        "{!username}": user.name,
                        "{!casename}": req.body.name
                    };
                    mailer.sendMail(user.email, params, template, "Subj");
                }
            );
        }
    );
};

exports.approve = function(req, res, next) {
    caseId = req.body.id;
    status = req.body.status;

    User.findOneAndUpdate({
            "cases._id": caseId
        }, {
            $set: {
                "cases.$.status": status
            }
        }, {
            upsert: true
        },
        function(err, user) {
            if (err) {
                log.error('%s %s', err.name, err.message);
                return res.json({
                    success: false
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
                "{!username}": user.name,
                "{!casenumber}": user.number
            };
            if (template) mailer.sendMail(user.email, params, template, "Subj");
        }
    );
};

exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
