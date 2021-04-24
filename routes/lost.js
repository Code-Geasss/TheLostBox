var express = require('express');
const router = express.Router();

const Post = require('../models/post');
const Notification = require('../models/notification');

router.get("/form",function(req,res,next){  
    res.render('lostform');  
});

router.post("/form",function(req,res,next){
    
    var brand = req.body.bname;
    var color = req.body.color;
    var category_name = req.body.category;

    Post.aggregate([
        {$match:{category_name:category_name}},
        {$unwind:"$posts"},
        {$match:{"posts.color":color,"posts.brandname":brand}}
    ]).exec(function(err,result){
        if(err) console.log(err);
        console.log(result);

        for(index in result){
            var newNotification = new Notification({
                id : result[index].posts.id,
                senderId : req.user._id,
                receiverID : result[index].posts.postedBy,
                brandName : brand,
                isAccept : false
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
});


router.get('/notification',function (req,res) {
    var currentUser = req.user;
    Notification.find({
        $or : [{"senderId" : currentUser._id}, {"receiverId" : currentUser._id}]
    },function(err,result){
        if(err){
            console.log(err);
        }
        else{
            res.render('notification',{result:result ,currentUser:currentUser}); 
            console.log(currentUser);
        }
    });
});

module.exports = router;
