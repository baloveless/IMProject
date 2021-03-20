const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

require('../models/users');

const Users = mongoose.model('users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, function(email, password, done) {
    Users.findOne({ email: email }).then(( user) => { 
    if (!user || !user.validatePassword(password)) {
      return done(null, false, { message: 'Invalid email or password.' });
    } else 
      return done(null, user);
    }).catch(done);
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (user, done) {
  Users.findById(id, function (err, user) {
    done(err, user);
  });
});