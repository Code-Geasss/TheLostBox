const { isAuthenticated, unauthorised } = require('../config/auth_required');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Post = require('../models/post');

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
  };
  
const storage = multer.diskStorage({
destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
    error = null;
    }
    cb(error, "images/");
},
filename: (req, file, cb) => {
    const name = file.originalname
    .toLowerCase()
    .split(" ")
    .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name);
}
});
  


router.post("/post/create",unauthorised,multer({ storage: storage }).single("photo"),(req, res, next) => {
    
    data=path.join('/images/' + req.file.filename);
    var path2 = data.replace(/\\/g, '/');
    var title = req.body.title;
    var description=req.body.description;
    var category=req.body.category;
    var location=req.body.location;
    let post = new Post();
    post.title=title;
    post.category=category;
    post.location=location;
    post.description=description;
    post.photo=path2;
    post.postedBy = req.user._id;
    post.save((err,result)=>{
        if(err){
            console.log(err);
        }
        //console.log(post);
        res.redirect("/");
    });
});

router.get('/post/create',isAuthenticated,function(req,res){
    res.render('upload',{currentUser: req.user});
});

router.get('/box',isAuthenticated,function(req,res){
    Post.find({},function(err,allposts){
        if(err)
        {
            console.log(err);
        }
        else{
            res.render('thebox',{posts:allposts,currentUser:req.user});
        }
    });
});

router.get('/box/:id',isAuthenticated,function(req,res){
    var postid=req.params.id;
    Post.findOne({_id:postid}).
    populate('postedBy').
    exec(function(err,foundpost){
        if(err){
            console.log(err);
        }
        else
        {
            res.render('item',{post:foundpost});
        }
    });
});


//router.put("/post/:postId", isAuthenticated , isPoster, updatePost);

module.exports = router;