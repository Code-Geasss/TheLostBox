var express = require('express');
const router = express.Router();

const Post = require('../models/post');

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
        res.render('thebox',{data:result,currentUser:req.user});
    });


});

module.exports = router;
