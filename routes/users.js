var express = require('express');
const e = require("express");
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next ) {
  res.render('register', {
    'title': 'Register'
  });
});

router.get('/login', function (req, res, next ) {
  res.render('login', {
    'title': 'Log In'
  });
});

router.post('/register', function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

// Check for image field
  if(req.files.profileImage) {
    console.log('Uploading File...');

    //File Info
    var profileImageOriginalName = req.files.profileImage.originalname;
    var profileImageName = req.files.profileImage.name;
    var profileImageMime = req.files.profileImage.mimeType;
    var profileImagePath = req.files.profileImage.path;
    var profileImageExt = req.files.profileImage.extension;
    var profileImageSize = req.files.profileImage.size;
  } else {

    // Set a default image
      var profileImageName = 'noImage.png';
  }

  req.checkBody('name', 'Name Field is required').notEmpty();
  req.checkBody('email', 'Email Field is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('username', 'Username Field is required').notEmpty();
  req.checkBody('password', 'Password Field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // Check for errors
  var errors = req.validationErrors();

  if(errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImageName
    });

    // Create User
    User.createUser(newUser, function (err, user) {
      if(err) throw err;
      console.log(user);
    });

    // Success Message
    req.flash('success', 'You are now registered and may log in');

    res.location('/');
    res.redirect('/');

  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
    function (username, password, done) {
      User.getUserByUsername(username, function (err, user) {
        if(err) throw err;
        if(!user) {
          console.log('Unknown User');
          return done(null, false, {message: 'Unknown User'});
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
          if(err) throw err;
          if(isMatch) {
            return done(null, user);
          } else {
            console.log('Invalid Password');
            return done(null, false, {message: 'Invalid Password'});
          }
        })
      });
    }
));

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login',
  failureFlash: 'Invalid username or password'
}), function (req,res){
  console.log('Authentication successful'  );
  req.flash('success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', function (req, res) {
  req.logout();
  console.log('LogOut successful');
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
