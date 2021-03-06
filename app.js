var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
const cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');
const imagesRouter = require('./routes/images');
const searchRouter = require('./routes/search');

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
app.use('/images', imagesRouter);
app.use('/search', searchRouter);
app.use("/uploads", express.static("uploads"));

module.exports = app;
