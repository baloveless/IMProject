const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  hash: String,
  salt: String,
  friends: [Object],
  chats: [String],
});

// friend item should be an object containing a username,
// email and id, some have request field
userSchema.methods.addFriend = function (friend) {
	if (!friend || !friend.email || !friend.username || !friend.id) return false;
	for (var x = 0; x < this.friends.length; x++){
		if (this.friends[x].email == friend.email)
			return false;
	}
	this.friends.push(friend);
 	this.save();
  return true;
};

// when the user confirms the request, the request field is removed.
userSchema.methods.confirmFriendReq = function (username) {
  if (username === undefined) return false;
  this.friends.find({ username }).then((friend) => {
    friend = { username: friend.username, email: friend.email, id: friend.id };
  });
  this.save();
  return true;
};

// removes a friend from a users friends list
userSchema.methods.deleteFriend = function (username) {
  if (username === undefined) return false;
  this.friends.pull({ username: username }).then((user, err) => {
    if (err)
      return false
    return true;
  });
};

// returns users friends list without ids
userSchema.methods.friendsList = function () {
  var friendsList = [];
	this.friends.forEach((friend, i) => {
		if (friend.request === undefined)
    	friendsList.push({ username: friend.username, email: friend.email });
	});
	return friendsList;
};

// returns users pending friend requests
userSchema.methods.friendRequests = function () {
  var friendsList = [];
	this.friends.forEach((friend, i) => {
		if (friend.request !== undefined && friend.request)
    	friendsList.push({ username: friend.username, email: friend.email });
	});
	return friendsList;
};

// accepts a username and returns true if it is properly formatted
// and false if not
userSchema.methods.checkUserName = function (username) {
  var format = /[^a-zA-Z0-9\-_.!]/; // matches for any non alpha numeric characters
  if (format.test(username)) return false;
  else return true;
};

// checks if the users email is formatted properly
userSchema.methods.checkEmail = function (email) {
  var format = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
  if (format.test(email)) return true;
  else return false;
};

// creates and stores hashed password
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

// checks password
userSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

userSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 7); // tokens last for 1 week

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    "secret"
  );
};

userSchema.methods.toAuthJSON = function () {
  return {
    email: this.email,
    id: this._id,
    token: this.generateJWT(),
  };
};

module.exports = mongoose.model("users", userSchema);
