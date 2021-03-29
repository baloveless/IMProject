const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../../auth");
require("../../../models/users");
const Users = mongoose.model("users");

// get a users friends list. requires the payload to include the users
// id and their jwt
router.get("/", auth.required, (req, res, next) => {
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
router.post("/", auth.required, (req, res, next) => {
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
          if (
            !current.addFriend({
              email: user.email,
              username: user.username,
              id: toRequest._id.toString(),
              request: false,
            }) || // request is false for sender
            !toRequest.addFriend({
              email: current.email,
              username: current.username,
              id: current._id.toString(),
              request: true,
            })
          ) {
            return res.status(422).json({
              errors: {
                user: "Friend request already sent",
              },
            });
          }
        }
        current.save();
        toRequest.save()
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
router.post("/delete", auth.required, async (req, res, next) => {
  const {
    body: { user },
  } = req;
  if (!user.senderId) {
    return res.status(422).json({
      errors: {
        friend: "Need your id to delete",
      },
    });
  }
  if (!user.username) {
    return res.status(422).json({
      errors: {
        friend: "Need username to delete",
      },
    });
  }
  Users.find({
    $or: [{ _id: user.senderId }, { username: user.username }],
  }).then((users) => {
    if (!users) return res.sendStatus(400);
    if (!users[1].deleteFriend(users[0].username) || !users[0].deleteFriend(users[1].username)) {
      users[0].save();
      users[1].save();
      return res.status(422).json({
        errors: {
          friend: "Failed to find in friends list",
        },
      });
    }
    else {
      users[0].save();
      users[1].save();
      if (users[0]._id == user.senderId)
        return res.json({ friends: users[0].friendsList() });
      else return res.json({ friends: users[1].friendsList() });
    }
  });
});

module.exports = router;
