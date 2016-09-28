var express    = require('express');
var passport   = require('passport');

var controller = require('./case.controller');
var auth       = require('../../libs/auth');

var router = express.Router();

router.get('/', auth.isAuthenticated(), auth.isAdmin(), controller.cases);
router.get('/usercases', auth.isAuthenticated(), auth.isAdmin(), controller.userCases);
router.post('/add', auth.isAuthenticated(), auth.isApproved(), controller.add);
router.post('/approve', auth.isAuthenticated(), auth.isAdmin(), controller.approve);

module.exports = router;
