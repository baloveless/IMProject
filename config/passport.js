const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

require("../models/users");

const Users = mongoose.model("users");

passport.use(
  new LocalStrategy(
    {
      usernameField: "user[email]", // email
      passwordField: "user[password]",
    },
    function (email, password, done) {
      Users.findOne({ email })
        .then((user) => {
          if (!user || !user.validatePassword(password)) {
            return done(null, false, { errors: { 'email or password': 'is invalid' }});
          } else return done(null, user);
        })
        .catch(done);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (user, done) {
  Users.findById(id, function (err, user) {
    done(err, user);
  });
});
