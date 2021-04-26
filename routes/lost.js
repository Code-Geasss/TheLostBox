var express = require('express');
const router = express.Router();

const Post = require('../models/post');
const Notification = require('../models/notification');
const { isAuthenticated, unauthorised } = require('../config/auth_required');

router.get("/form",isAuthenticated,function(req,res,next){ 
    var errMsg = req.flash('error')[0]; 
    res.render('lostform',{currentUser: req.user,errMsg: errMsg, noMessages: !errMsg });  
});

router.post("/form",unauthorised,function(req,res,next){
    
    var brand = req.body.bname;
    var color = req.body.color;
    var category_name = req.body.category;
    var description=req.body.description;
    var currentUser = req.user;

    if(description.length == 0 || category_name.length == 0 || 
        color.length == 0 || brand.length == 0){
            console.log("err ke andar");
            req.flash('error', 'Please fill all the fields'); 
            res.redirect("/form");
    }
    else{

        Post.aggregate([
            {$match:{category_name:category_name}},
            {$unwind:"$posts"},
            {$match:{"posts.color":color,"posts.brandname":brand,"posts.postedBy":{'$ne':currentUser._id}}},
        ]).exec(function(err,result){
            if(err) console.log(err);
            console.log(result);

            for(index in result){
                var newNotification = new Notification({
                    id : result[index].posts._id,
                    senderId : req.user._id,
                    receiverID : result[index].posts.postedBy,
                    brandName : brand,
                    description:description,
                    isAccept : 0
                });

                console.log(newNotification);
                newNotification.save(function(err,result){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("ok");
                    }
                });
            }
            res.redirect('/');
        });
    }
});


router.get('/accept/:id',unauthorised,function(req,res){

    var noteId = req.params.id;
    Notification.findOneAndUpdate({
        "_id" : noteId
    },{
        $set : {isAccept : 1}
    },{
        new : true
    },function(err,data){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/notification");
        }        
    });
});


router.get('/reject/:id',unauthorised,function(req,res){

    var noteId = req.params.id;
    Notification.findOneAndUpdate({
        "_id" : noteId
    },{
        $set : {isAccept : 2}
    },{
        new : true
    },function(err,data){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/notification");
        }        
    });
});

router.get('/notification',isAuthenticated ,function (req,res) {
    var currentUser = req.user;
               
    Notification.find({
        $or : [{"senderId" : currentUser._id}, {"receiverID" : currentUser._id}]
    })
    .populate('receiverID senderId')
    .exec(function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log("hy");
            console.log(result);
            res.render('notification',{result:result ,currentUser:currentUser}); 
        }
    });
});

module.exports = router;
