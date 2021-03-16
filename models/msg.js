const mongoose = require('mongoose');

const msgSchema =  new mongoose.Schema({
	msg: String,
	username: String,
});


module.exports = mongoose.model('msg', msgSchema);