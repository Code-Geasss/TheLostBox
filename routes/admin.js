var express = require('express');
const router = express.Router();

const Post = require('../models/post');
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

function isAdmin(req,res,next){
    if(req.user.isAdmin){
        return next();
    }
    res.redirect('/');
};

module.exports = router;