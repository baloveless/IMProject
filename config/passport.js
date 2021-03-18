const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

require('../models/users');

const Users = mongoose.model('users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, function(email, password, done) {
    User.findOne({ email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));