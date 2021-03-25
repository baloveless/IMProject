const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../../auth");
require("../../../models/users");
const Users = mongoose.model("users");

//POST new user route (optional, everyone has access)
router.post("/", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  console.log(JSON.stringify(user));

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  if (!user.username) {
    return res.status(422).json({
      errors: {
        username: "is required",
      },
    });
  }

  // check database for existing user
  Users.findOne(
    { email: user.email, username: user.username },
    (err, existingUser) => {
      if (existingUser !== null) {
        // user already exists
        console.log("Found a user");
        return res.status(422).json({
          errors: {
            email: "has an account",
          },
        });
      } else {
        // can create user
        const finalUser = new Users(user);
        // check if email is malformed
        if (!finalUser.checkEmail(user.email)) {
          return res.status(422).json({
            errors: {
              email: "is malformed",
            },
          });
        }
        // check is username is malformed
        if (!finalUser.checkUserName(user.username)) {
          return res.status(422).json({
            errors: {
              username: "contains illegal characters",
            },
          });
        }

        // if not malformed okay to save finalUser and send response
        finalUser.setPassword(user.password);

        return finalUser
          .save()
          .then(() => res.json({ user: finalUser.toAuthJSON() }));
      }
    }
  );
});

//POST login route (optional, everyone has access)
router.post("/login", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;
  if (user === undefined) console.log("User undefined");

  console.log(JSON.stringify(user));
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.sendStatus(400).info;
    }
  )(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get("/current", auth.required, (req, res, next) => {
  const {
    payload: { id },
  } = req;

  return Users.findById(id).then((user) => {
    if (!user) return res.sendStatus(400);

    return res.json({ user: user.toAuthJSON() });
  });
});

// deletes current user
router.delete("/current", auth.required, (req, res, next) => {
  const {
    payload: { id },
  } = req;
  return Users.findByIdAndDelete(id).then((user) => {
    if (!user) return res.sendStatus(400);
    return res.json({ response: "User deleted" });
  });
});

module.exports = router;
