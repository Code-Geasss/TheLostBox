const express = require('express');
const router = express.Router();
const passport = require('passport');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var async = require('async');
var nodemailer = require('nodemailer');

//IMporting models
var User = require('../models/user');

router.get('/',function(req,res){
    res.render('index');
});

router.get('/forgot',function(req,res){
    var messages = req.flash();
    res.render('Forgotpassword',{user:req.user,messages:messages});
});

router.post('/forgot', function(req, res, next) {
    console.log("POST route");
      async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ email: req.body.email }, function(err, user) {
            if (!user) {
              req.flash('error', 'No account with that email address exists.');
              console.log('Cannot find user');
              return res.redirect('/forgot');
            }
    
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date. now() + 3600000; // 1 hour
    
            user.save(function(err) {
              console.log("Hello")
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
  
          var url = req.protocol + '://' + req.headers.host + '/reset/' + token;
          var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vinit.mundra@somaiya.edu',
              pass: process.env.EMAIL_PASS
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'vinit.mundra@somaiya.edu',
            subject: 'Password Reset for your Lostbox account',
            // text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            //   'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            //   'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            //   'If you did not request this, please ignore this email and your password will remain unchanged.\n',
              html: `<div style=" width:350px; margin:50px auto; background-color: #cad2de; padding: 20px; font-size: 18px; size: 20px; font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">
          
              <p>Hi <b>${ user.email }</b></p>
              <p>We got a request to <b>reset your Lostbox Password.</b></p>
              <div style="text-align: center; margin-bottom: 20px;">
                    <a style="width: 300px;font-size: 16px;background-color: white;color: black;
                    border: 2px solid green;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;" href=${ url }><b>Reset Password </b></a>
              </div>
              <p>If you ignore this message your password will not be changed.
        
          
              </div>`
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            console.log(err);
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
      });
    });
  
    router.get('/reset/:token', function(req, res) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log("Found incorrect token");
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
        }
        //console.log("Found correct token");
        var messages = req.flash();
        res.render('ResetPassword', {
            user: req.user,
            messages: messages
        });
      });
    });
  
    //Reset Password here
    router.post('/reset', function(req, res) {
      var password = req.body.password;
      var cpassword = req.body.cpassword;
      var token = req.body.token;
      var url = "/reset/".concat(token);
      if( password == '' || cpassword == ''){
        req.flash('error','Enter all fields');
        return res.redirect(url);
      }
      if( password != cpassword){
        req.flash('error','Passwords do not match');
        return res.redirect(url);
      } 
      async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              console.log(req.body.token);
              return res.redirect('back');
            }
            console.log("Inside");
            user.password = bcrypt.hashSync(req.body.password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
    
            user.save(function(err) {
              // req.logIn(user, function(err) {
                done(err, user);
              // });
            });
          });
        },
      ], function(err) {
        res.redirect('/logIn');
      });
    });

router.get('/Signup', function (req, res) {
    var messages = req.flash('error');
    res.render('signup',{messages: messages, hasError: messages.length > 0 });
});

router.post('/Signup', passport.authenticate('local.signup', {
    failureRedirect: '/Signup',
    failureFlash: true
}),function(req,res){
   
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        User.findOne({'email': req.body.email}, function(err, user){
           
            res.redirect('/LogIn');   
        });
    }
    
});

router.get('/LogIn',function (req, res) {
    var messages = req.flash('error');
    res.render('login',{messages: messages, hasError: messages.length > 0 });
});

router.post('/LogIn', passport.authenticate('local.signin', {
    failureRedirect: '/LogIn',
    failureFlash: true
}), function(req,res){
    if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        User.findOne({'email': req.body.email}, function(err, user){
          if(user.isAdmin){
              console.log(user);
              res.redirect('/admin');   
          }
          else{

              res.redirect('/');   
          }
        });
    }
    
});


router.get('/logIn/google',passport.authenticate('google',{scope:['profile','email']}));

router.get('/logIn/google/callback',passport.authenticate('google',{failureRedirect:'/logIn'}),
function(req,res){
    res.redirect('/');
});

router.get('/logout', function(req, res, next){
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
