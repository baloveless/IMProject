const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	hash: String,
	salt: String,
	friends: [String],
	chats: [String]
});

// friend item should be an object containing a username, and
// their id.
userSchema.methods.addFriend = function (friend) {
	if (friend.id === undefined || friend.username === undefined)
		return false;
};

// accepts a username and returns true if it is properly formatted
// and false if not 
userSchema.methods.checkUserName = function (username) {
	var format = /[^/w\-_.!]/g; // matches for any non alpha numeric characters
	if (format.test(username))
		return false;
	else
		return true;
};

// checks if the users email is formatted properly
userSchema.methods.checkEmail = function (email) {
	var format = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (format.test(email))
		return true;
	else
		return false;
};

// creates and stores hashed password
userSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// checks password
userSchema.methods.validatePassword = function (password) {
	const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJWT = function () {
	const today = new Date();
	const expirationDate = new Date(today);
	expirationDate.setDate(today.getDate() + 7); // tokens last for 1 week

	return jwt.sign({
		email: this.email,
		id: this._id,
		exp: parseInt(expirationDate.getTime() / 1000, 10),
	}, 'secret');
};

userSchema.methods.toAuthJSON = function () {
	return {
		email: this.email,
		id: this._id,
		token: this.generateJWT(),
	};
};


module.exports = mongoose.model('users', userSchema)