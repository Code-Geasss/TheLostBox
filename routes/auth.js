const express = require('express');
const router = express.Router();
const passport = require('passport');

//IMporting models
var User = require('../models/user');

router.get('/',function(req,res){
    res.render('index');
});

router.get('/box',function(req,res){
    res.render('thebox');
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
            console.log('login hogaya');
            res.redirect('/');   
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
