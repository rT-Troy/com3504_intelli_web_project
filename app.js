var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/posts');
var addRouter = require('./routes/add');
var displayRouter = require('./routes/display');
var nicknameRouter = require('./routes/nickname');
var searchPlantsRouter = require('./routes/search-plants');

var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public/images/uploads', express.static(path.join(__dirname, '/public/images/uploads')));
app.use(express.static('public'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', addRouter);
app.use('/',displayRouter);
app.use('/',nicknameRouter);
app.use('/', searchPlantsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
