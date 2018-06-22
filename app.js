const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


// connecte with database
mongoose.connect(config.database);

// for connection
var db = mongoose.connection;

// check connection
db.once('open', function(){
  console.log('connected to mongodb...');
});

// check for db console.error
db.on('error', function(err){
  console.log(err);
});

// init app
const app = express();

// bring in model
let Article = require('./models/article');

// we use bootstrap bower

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

// body parser middleware parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value : value
        };
    }
}));


// passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// for all route // global variable
// check if user log in then that user or null;

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});


// home route
app.get('/', function(req, res) {
  // let articles = [
  //   {
  //     id: 1,
  //     title: 'Article 1',
  //     author: 'Rutul Darji',
  //     body: 'this is article 1'
  //   },
  //   {
  //     id: 2,
  //     title: 'Article 2',
  //     author: 'Sahil Surani',
  //     body: 'this is article 2'
  //   },
  //   {
  //     id: 3,
  //     title: 'Article 3',
  //     author: 'RKO',
  //     body: 'this is article 3'
  //   },
  // ];


  /* in find we have to write query nut we want all articles
  so only write {}*/

  // it take article and also response
  Article.find({}, function(err, articles) {
    if(err) {
      console.log(err);
    }
    else {
      // response we get that we store in articleList
      res.render('index', {
        title: 'Articles',
        articleslist : articles
      });
    }
  });
});


// anything that to /articles that goes to that file
let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);

//start server
app.listen(3000, function() {
  console.log('server is running..');
});
