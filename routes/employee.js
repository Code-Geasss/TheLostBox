
var express = require('express');
const router = express.Router();
var empModel = require('../models/employee');
var employee = empModel.find({});

const Post = require('../models/post');

router.get("/form",function(req,res,next){
    
    res.render('employee');
   
});

router.post("/form",function(req,res,next){

    
    var title = req.body.uname;
    var description = req.body.email;
    var category_name = req.body.category;
    
    console.log(req.body);

    Post.find({"category_name":category_name},{posts: {$elemMatch : {title:title}},function(err,result){

        console.log("Hii");
        if(err) console.log(err);
        if(result.length!=0){
            
            console.log(result);

        }else{
            newPost.save(function(err,result){
                if(err) console.log(err);
                else{
                 req.flash('success', 'Sucessfully added Post');
                 res.redirect("/");
                }
            });
        }
    }});

    
    empDetails.save(function(err,res1){
        if(err) throw err;
        employee.exec(function(err,data){
            if(err) throw err;
            res.render('form',{title : 'Employee Records', records:data});
        });
    });

    
});

module.exports = router;
