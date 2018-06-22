const express = require('express');
const router = express.Router();

// bring in Article model
let Article = require('../models/article');

// bring in User model
let User = require('../models/user');

// add route
router.get('/add', ensureAuthenticated, function(req ,res){
  res.render('add_article', {
    title: 'Add Articles'
  });
});

//  add Submit POST route

router.post('/add',function(req, res) {
  //first for whom and then message
  // after . provide message for what validation
  req.checkBody('title','Title is Required').notEmpty();
  //req.checkBody('author','Author is Required').notEmpty();
  req.checkBody('body','Body is Required').notEmpty();

  // get the error if any

  let errors = req.validationErrors();

  if(errors) {
    res.render('add_article', {
      title: 'Add Articles',
      errors: errors
    });
  }
  else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function (err) {
      if(err) {
        console.log(err);
        return;
      } else {
        req.flash('success','Article Added');
        res.redirect('/');
      }

    });
  }//else

});

// Load Edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if(article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
      return;
    }
    res.render('edit_article', {
      title : 'Edit Article',
      article: article
    });
  });
});

//Update  submit

router.post('/edit/:id', function(req, res) {
  let article = {};

  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id: req.params.id }

  /*
  we are not creating new data to work with the model
  and takes 3 param
  1) query
  2) data
  3) callback function
  */
  Article.update(query, article,function (err) {
    if(err) {
      console.log(err);
      return;
    } else {
      req.flash('success','Article Updated');
      res.redirect('/');
    }

  });
});

router.delete('/:id', function(req, res) {

if(!req.user._id) {
  res.status(500).send();
}

let query = { _id: req.params.id }

Article.findById(req.params.id, function(err, article) {
  if(article.author != req.user._id) {
    res.status(500).send();
  }
  else {
      Article.remove(query, function(err) {
        if(err) {
          console.log(err);
        }

        res.send('Success');
      });
  }//else
});

});

// put in bottom otherwise anything starts with / goes to this on
// Get single Article
router.get('/:id', function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    // to fetch username
    User.findById(article.author, function(err,user) {
      res.render('article', {
        article: article,
        author: user.name
      });
    });

  });
});


// Access control
function ensureAuthenticated(req, res, next) {
  // this is passport function
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please Login');
    res.redirect('/users/login');
  }
}


module.exports = router;
