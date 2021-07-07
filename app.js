var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
const cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "9y_+Y8wV5?",
//   database: "recipe_book",
// });
// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected!");
// });

module.exports = app;
