const { isAuthenticated, unauthorised } = require('../config/auth_required');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


var User = require('../models/user');
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


router.get('/profile',isAuthenticated,function(req,res){
    var currentUser= req.user;

    Post.aggregate([
        {$unwind:"$posts"},
        {$match:{"posts.postedBy":currentUser._id}},
    ]).exec(function(err,result){
        if(err) console.log(err);
        console.log(result);
        res.render('profile',{currentUser:currentUser,result:result});
    });
   
});


router.post('/save', unauthorised,multer({ storage: storage }).single("photo"),(req, res, next) => {
    console.log(req.body);
    var name = req.body.fullname;
    var about = req.body.about;
    data=path.join('/images/' + req.file.filename);
    var path2 = data.replace(/\\/g, '/');
    console.log(path2);
    
    User.findOneAndUpdate({email:req.user.email},{fullname:name,about:about,profile_image:path2},function(err,result){
        if(err) console.log(err);
        res.redirect('/profile');
    });
});

module.exports=router;