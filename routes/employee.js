var express = require('express');
const router = express.Router();

const Post = require('../models/post');

router.get("/form",function(req,res,next){  
    res.render('employee');  
});

router.post("/form",function(req,res,next){

    
    var title = req.body.uname;
    var description = req.body.email;
    var category_name = req.body.category;
    
    console.log(title);

    Post.find({"category_name":category_name},{posts:{ $elemMatch :{title:title}}},function(err,result){

        console.log("Hii");
        data1=[...result]
        if(err) console.log(err);
        console.log(data1);
        res.render('thebox',{data:data1,currentUser:req.user});
    });


});

module.exports = router;
