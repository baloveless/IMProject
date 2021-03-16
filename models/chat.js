
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
	messages: [{type:  mongoose.Schema.Types.ObjectId, ref: 'msg'}], 
	users: [String]
});


module.exports = mongoose.model('chat', chatSchema);