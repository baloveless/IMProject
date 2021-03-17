var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');

var AllowedUserName = /[^a-zA-Z0-9]/g;
var AllowedChat = /[^a-zA-Z0-9!.,?]/g;

require("dotenv").config();

const mongoose = require('mongoose');
const { assert } = require('assert');
mongoose.set('useFindAndModify', false);
const Chat = require('./models/chat');
// insert in .env for local connection 'mongodb://localhost/IMProject'
mongoose.connect(process.env.DATABASE, {
	useUnifiedTopology: true,
	// useNewUrlParser: true // for local connection
});

mongoose.connection.on('error', (err) => {
	console.log("Mongoose Connection error: " + err.message);
});

mongoose.connection.once('open', () => {
	console.log('Connected to Database');
});

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index-old.html');
});

app.get('/test', function(req, res) {
   res.sendFile(__dirname + '/test.html');
});

require("./models/user");



const User = mongoose.model('user');



io.on('connection', function (socket) {
	var user; // holds user id
	var username;
	var room; // holds chat room id
	console.log('A user connected');

	// login, takes a string and emits userSet
	socket.on('setUsername', function (data) {
		console.log('User attempting to set name: ' + data);
		badInput(data).then(() => {
			getUserByName(data).then((existingUser) => {
			console.log('User login search returned: ' + existingUser);
				if (existingUser) {
					user = existingUser._id;
					username = existingUser.username;
					console.log(existingUser);
					socket.emit('userSet', { username: data });
				} else
					socket.emit('Error', 'Login to ' + data + ' failed');
			}).catch(error => {
				throw error;
			});
		}).catch(error => {
			throw error;
		}).then(() => {
			
		}).catch(error => {
			console.log(error);
		});
	});

	// creates a new user 
	socket.on('createUser', function (data) {
		badInput(data).then(() => {
			getUserByName(data).then((existingUser) => {
				if (existingUser) {
					socket.emit('Error', data + ' is already taken');
				} else {
					const newUser = new User({
						username: data
					});
					newUser.save();
					user = newUser._id;
					console.log('New User with id: ' + user);
					socket.emit('userSet', { username: data });
				}
			}).catch(error => {
				throw error;
			});
		}).catch(error => {
			console.log(error);
		});
	});

	socket.on('logout', () => {
		console.log('user logged, still connected')
		user = undefined;
		room = undefined;
		noUser();
	});

	// called when tried to access without user registered
	function noUser() {
		socket.emit('noUser');
		socket.emit('Error', 'Please login to access functionalities');
	}
	
	// called when tried to access without room registered
	function noRoom() {
		socket.emit('noRoom');
		socket.emit('Error', 'No room to send to');
	}

	// called when there is malformed input true indicates input is malformed
	function badInput(data) {
		var ret;
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				if (typeof (data) === 'string') {
					console.log(data + ' is a string');
					ret = AllowedUserName.exec(data);
				}else {
					ret = [];
					for (var i = 0; i < data.length; i++){
						ret[i] = AllowedUserName.exec(data[i]);
					}
				}
				if (ret) {
					socket.emit('Error', data + ' contains illegal character(s): ' + ret.toString());
					reject(data + ' contains illegal character(s): \"' + ret.toString()+ '\"');
				}else
					resolve();
			}, 1000);
		});
	}

	function badChat(data) {
		var ret;
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				if (typeof (data) === 'string') {
					console.log(data + ' is a string');
					ret = AllowedChat.exec(data);
				}else {
					ret = [];
					for (var i = 0; i < data.length; i++){
						ret[i] = AllowedChat.exec(data[i]);
					}
				}
				if (ret) {
					console.log(data + ' contains illegal character(s)\"' + ret.toString() + '\"\n******');
					socket.emit('Error', data + ' contains illegal character(s): ' + ret.toString());
					reject(data + ' contains illegal character(s): ' + ret.toString());
				}else
					resolve();
			}, 5000);
		});
	}

	// returns user mongo entry by name
	const getUserByName = async (name) => {
		try {
			const existingUser = await User.findOne({ username: '' + name }).exec()
				console.log('Finding user by name: ' + name + ': ' + existingUser);
				return existingUser;
			} catch (error) {
				return 'error occured: ' + error;
			}
	}

	// get user by user id
	const userProf = async () => {
		if (user === undefined) {
			noUser();
			return 'error occured: no user';
		}
		try {
			const userProf = await User.findOne({ _id: user }).exec()
			return userProf
		} catch (error) {
			return 'error occured: ' + error;
		}
	}
	require("./models/msg");

	const Msg = mongoose.model('msg');

	const addMessage = async (newMsg) => {
		try {
			const currRoom = await Chat.findByIdAndUpdate(room, { $push:{messages: newMsg }}, { safe: true, upsert: true }).exec();
			console.log('Chat found :' + currRoom);
			return currRoom;
		} catch (err) {
			console.log('error occured in finding room: ' + err);
			return err;
		}
	}

	// saves a new message to the data base and sends them to the sockets. 
	socket.on('msg', function (data) {
		if (room === undefined) {
			noRoom();
			return;
		}
		const newMsg = new Msg({
			msg: data.message,
			username: data.user
		});
		newMsg.save();
		console.log('new msg to: ' + room + ': ' + newMsg);

		addMessage(newMsg).then(() => {
			//Send message to everyone
			console.log('Made it to emit');
			io.sockets.emit('newmsg', data);
		}).catch(error => {
			console.log(error)
		});
	});

	socket.on('disconnect', function () {
		console.log('user disconnected');
	});

	// returns chat lists
	const getChats = async (chats) => {
			try{
				const getChats = await Chat.find({ _id: { $in: chats } }).exec();
				return getChats;
			} catch (error) {
				return 'error occurred ' + error;
			}
	}

	// gets the chat list from the user
	socket.on('getchats', () => {
		if (user === undefined) {
			noUser();
			return;
		}
		room = undefined;
		var disp = [];
		var chats;
		console.log('Getting chats');
		
		userProf().then((user) => {
			getChats(user.chats).then((toShow) => {
				for (var x = 0; x < toShow.length; x++) {
					disp[x] = '';
					for (var i = 0; i < toShow[x].users.length; i++) {
						disp[x] += toShow[x].users[i] + ', ';
					}
				}
				console.log(disp);
				console.log(chats);
				socket.emit('chatlist', disp, user.chats);
			}).catch(error => {
				throw error;
			});
		}).catch(error => {
			throw error;
		}).catch(error => {
			console.log(error);
		})
	});


	// selects a chat and emits the chat log to the client socket
	socket.on('chooseRoom', (id) => {
		console.log('Room ' + id + ' selected');
		const messages = async () => {
			try {
				const messages = await Chat.findById(id).exec();
				console.log('Stored chat found: ' + messages);
				room = messages._id;
				return messages;
			} catch (err) {
				return err;
			}
		}
		
		messages().then((messages) => {

			console.log('room: ' + room);
			console.log(messages);

			var msgs = [];
			var users = []
			const log = async () => {
				try {
					const log = await Msg.find({ _id: { $in: messages.messages } }).exec();
					return log;
				} catch (error) {
					return 'error occured: ' + error;
				}
			}
			log().then((log) => {
				for (var x = 0; x < log.length; x++)
				{
					msgs[x] = log[x].msg;
					users[x] = log[x].username;
				}

				socket.emit('enterRoom', msgs, users)
			});
		});
	});

	// creates saves, and opens a new chat room, takes an array of strings as an argument. 
	socket.on('newRoom', (data) => {
			if (user === undefined) {
				noUser();
				return;
			}
			console.log('Creating new chat: ' + data);
			const newChat = new Chat({
				users: data
			});
			newChat.save();
			room = newChat._id;

			User.findOneAndUpdate({ _id: user }, { $push: { 'chats': room } }, { safe: true, upsert: true }
			).then(() => {
				for (var i = 0; i < data.length; i++)
					User.findOneAndUpdate({ username: data[i] }, { $push: { 'chats': room } }, { safe: true, upsert: true });
			}).then(() => {
				socket.emit('enterRoom');
			});
	});

	const deleteRoom = async (user, id) => {
		try {
			const room = await user.chats.deleteOne({ _id: id}).exec();
			return room;
		} catch (error) {
			return 'error occured: ' + error;
		}
	}


	socket.on('deleteRoom', (id) => {
		console.log('Deleting chat room: ' + id);
		userProf().then((user) => {
			deleteRoom(user, id).then(() => {
				console.log('Attempting to delete ' + id);
				socket.emit('chatListUpdate');
			}).catch(error => {
				throw error;
			});
		}).catch(error => {
			console.log(error);
		});
	});

});


http.listen(3000, function() {
   console.log('listening on localhost:3000');
});