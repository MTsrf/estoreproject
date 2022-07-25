const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const session = require('express-session')
const flash = require('req-flash');
const nocache =require('nocache')
const MongoStore = require('connect-mongo');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const sellerRouter = require('./routes/seller')
const dotenv = require('dotenv')
dotenv.config()

const app = express();




app.use(nocache());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({helpers: {
  inc: function (value, options) {
      return parseInt(value) + 1;
  }
}, extname:'hbs',layoutsDir: __dirname+'/views/layout',partialsDir: __dirname + '/views/partials'}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//express-session initials
app.use(session({
  secret:'secure key',
  resave:false,
  saveUninitialized:true,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/estore',
  }),
  cookie:{
    maxAge: 180 * 60 * 1000,
  }
}));
app.use(function(req,res,next){
  res.locals.session = req.session;
  next()
});

// flash message
app.use(flash());




app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/seller', sellerRouter);



//error page
app.get('*', (req, res) => {
  res.render('error',{layout:'error_layout'})
});

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
