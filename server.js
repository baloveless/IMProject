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
   res.sendFile(__dirname + '/index.html');
});

app.get('/test', function(req, res) {
   res.sendFile(__dirname + '/test.html');
});

app.get('/chatlist', function(req, res) {
   res.sendFile(__dirname + '/chatlist.html');
});

app.get('/createChat', function(req, res) {
   res.sendFile(__dirname + '/createChat.html');
});

app.get('/chatRoom', function(req, res) {
   res.sendFile(__dirname + '/chatRoom.html');
});

io.on('connection', function (socket) {
  // server functions here. 

});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});