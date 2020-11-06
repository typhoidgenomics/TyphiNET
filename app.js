const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + "/public")));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//     set locals,
//     only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     //render the error page
//     res.status(err.status || 200);
//     res.render('public/error');
// });

// use res.render to load up an ejs view file

// dashboard page
app.get('/', function(req, res) {
    res.render('public/dashboard');
});

// map page
app.get('/', function(req, res) {
    res.render('public/map');
});

// user page
app.get('/', function(req, res) {
    res.render('public/user');
});

app.listen(8080);
console.log('8080 is the magic port');

module.exports = app;