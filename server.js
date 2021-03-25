const express = require('express');
const path = require('path');
var passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session')
const cors = require('cors');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

// insert in .env for local connection 'mongodb://localhost/IMProject'
require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(passport.initialize());
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(require('./routes'));

// user created files
require('./config/passport');


if (!isProduction) {
   app.use(errorHandler());
}

// create http server
var http = require('http').Server(app);

mongoose.connect(process.env.DATABASE, {
   useUnifiedTopology: true,
   useNewUrlParser: true // for local connection
});
mongoose.connection.on('error', (err) => {
   console.log("Mongoose Connection error: " + err.message);
});

mongoose.connection.once('open', () => {
   console.log('Connected to Database');
});

if (!isProduction) {
   app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.json({
         errors: {
            message: err.message,
            error: err,
         },
      });
   });
}

app.use((err, req, res, next) => {
   res.status(err.status || 500);
   res.json({
      errors: {
         message: err.message,
         error: {},
      },
   });
});

http.listen(3000, function () {
   console.log('listening on localhost:3000');
});