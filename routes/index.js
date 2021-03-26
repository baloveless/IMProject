const express = require('express');
const router = express.Router();
const auth = require("./auth");

router.use('/api', require('./api'));

// webpages
// login screen
router.get('/login', auth.optional, (req, res, next) => {
  res.sendFile(__dirname + '/pages/loginScreen.html');
});

// create account screen
router.get('/create', auth.optional, (req, res, next) => {
  res.sendFile(__dirname + '/pages/createAccount.html');
});

// home page
router.get('/', auth.optional, (req, res, next) => {
  res.sendFile(__dirname + '/pages/index.html');
});

// get test suite: user tests
router.get('/usertests', auth.optional, (req, res, next) => {
  res.sendFile(__dirname + '/pages/user-tests.html');
});

// get test suite: friend tests
router.get('/friendtests', auth.optional, (req, res, next) => {
  res.sendFile(__dirname + '/pages/friends-tests.html');
});




module.exports = router;