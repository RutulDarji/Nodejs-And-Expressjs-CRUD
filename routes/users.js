const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();



// bring in User model
let User = require('../models/user');

// Register form
router.get('/register', function(req,res) {
  res.render('register');
});

//register process

router.post('/register', function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // validation
  req.checkBody('name','Name is Required').notEmpty();
  req.checkBody('email','Email is Required').notEmpty();
  req.checkBody('email','Email is not Valid').isEmail();
  req.checkBody('username','Username is Required').notEmpty();
  req.checkBody('password','password is Required').notEmpty();
  req.checkBody('password2','Password do not match').equals(req.body.password);

  // get the error if any
  let errors = req.validationErrors();

  if(errors) {
    res.render('register', {
      errors: errors
    });
  }
  else {
    let newUser = new User({
      name:name,
      email: email,
      username: username ,
      password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err,hash) {
        if(err) {
          console.log(err);
        }
        newUser.password = hash;

        newUser.save(function(err) {
          if(err) {
            console.log(err);
            return;
          }
          else {
            req.flash('success', 'You are now Registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });

  }

});

// login form
router.get('/login', function(req, res) {
  res.render('login');
});

// login process

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req,res) {
  req.logout();
  req.flash('success','You are logged Out');
  res.redirect('/users/login');
});


module.exports = router;
