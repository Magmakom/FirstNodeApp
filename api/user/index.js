var express = require('express');
var passport = require('passport');
var controller = require('./user.controller');
var auth = require('../../libs/auth');

var router = express.Router();

router.get('/', auth.isAuthenticated(), auth.isAdmin(), controller.users);
router.post('/login',
    passport.authenticate(
        'local', {
            session: false
        }),
    controller.login
);
router.post('/signup', controller.signup);
router.post('/approve', auth.isAuthenticated(), auth.isApproved(), auth.isAdmin(), controller.approve);
router.get('/role', auth.isAuthenticated(), auth.isApproved(), controller.role);

module.exports = router;
