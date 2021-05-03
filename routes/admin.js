var express = require('express');
const router = express.Router();

const Post = require('../models/post');
var User = require('../models/user');
const Notification = require('../models/notification');
const { isAuthenticated, unauthorised } = require('../config/auth_required');

router.get('/admin',isAuthenticated,isAdmin,function(req,res,next) {
    
    var successMsg = req.flash('success')[0];
    Post.find({},function (err,data) {
        
        if(err){
            console.log(err);
        }
        else{
            data1 = [...data];
            console.log(data1);
            res.render('admin/allposts', {posts:data1,successMsg: successMsg, noMessages: !successMsg});
        }
    })
});

router.get('/admin/user',isAuthenticated,isAdmin,function(req,res){

    User.find({isAdmin:'false'},function(err,res1){

        if(err){
            console.log(err);
        }
        else{
            console.log("inside");
            console.log(res1);
           res.render('admin/user',{user:res1});
        }
    });
});

function isAdmin(req,res,next){
    if(req.user.isAdmin){
        return next();
    }
    res.redirect('/');
};

module.exports = router;