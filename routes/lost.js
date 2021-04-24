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
                id : result[index].posts._id,
                senderId : req.user._id,
                receiverID : result[index].posts.postedBy,
                brandName : brand,
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
});


router.get('/accept/:id',function(req,res){

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


router.get('/reject/:id',function(req,res){

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

router.get('/notification',function (req,res) {
    var currentUser = req.user;
               
    Notification.find({
        $or : [{"senderId" : currentUser._id}, {"receiverID" : currentUser._id}]
    })
    .populate('receiverID')
    .exec(function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log(result);
            res.render('notification',{result:result ,currentUser:currentUser}); 
        }
    });
});

module.exports = router;
