const mongoose = require("mongoose");
const passport = require("passport");
const users = require("../../models/users");
const router = require("express").Router();
const auth = require("../auth");
require("../../models/users");
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

// get a users friends list. requires the payload to include the users
// id and their jwt
router.get("/:username/friends", auth.required, (req, res, next) => {
  const {
    payload: { id },
  } = req;
  return Users.findById(id).then((user) => {
    if (!user) return res.sendStatus(400);
    return res.json({ friends: user.friendsList() });
  });
});

// user item in body should contain either username or email field.
// and the senders id ({user: {senderId, email, username}})
router.post("/:username/friends/", auth.required, (req, res, next) => {
  const {
    body: { user },
  } = req;
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }
  // set value to a random defined value so the searches dont throw errors
  if (!user.senderId) {
    return res.status(422).json({
      errors: {
        senderId: "is required",
      },
    });
  }

  // figure out if friend exists
  return Users.findOne({ email: user.email }).then((friend) => {
    var toRequest = friend;
    if (friend !== undefined && friend) {
      // figure out if user requesting exists
      return Users.findById(user.senderId).then((current) => {
        if (user.email === current.email) {
          return res.status(422).json({
            errors: {
              friend: "Can't friend yourself",
            },
          });
        }
        if (current) {
          // adds friend to lists for both users.
          if (!current.addFriend({ email: user.email, username: user.username, id: toRequest._id.toString(), request: false,}) || // request is false for sender
            !toRequest.addFriend({ email: current.email, username: current.username, id: current._id.toString(), request: true, })) {
            return res.status(422).json({
              errors: {
                user: "Friend request already sent",
              },
            });
          }
        }
        return res.json({ friends: current.friendsList() });
      });
    } else
      return res.status(422).json({
        errors: {
          user: "friend doesn't exist",
        },
      });
  });
});

// this request should have  the users id, and the name of the user
// they want to remove from their friends list. 
router.post("/:username/friends/delete", auth.required, (req, res, next) => {
  const {
    body: { toDelete },
  } = req;
  if (!toDelete.senderId) {
    return res.status(422).json({
      errors: {
        friend: "Need your id to delete",
      },
    });
  }
  if (!toDelete.username) {
    return res.status(422).json({
      errors: {
        friend: "Need username to delete",
      },
    });
  }
  return users.findById(toDelete.senderId).then((user) => {
    if (!user)return res.sendStatus(400);
    if (!user.deleteFriend(toDelete.username)) return res.sendStatus(400);
    else return res.json({ friends: user.friendsList() });
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
