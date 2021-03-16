const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	chats: [String]
});

module.exports = mongoose.model('user', userSchema)