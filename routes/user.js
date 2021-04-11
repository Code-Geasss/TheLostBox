const { isAuthenticated, unauthorised } = require('../config/auth_required');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


var User = require('../models/user');

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
    res.render('');
});

router.post('/upload',unauthorised,multer({ storage: storage }).single("photo"),(req, res, next) => {
    data=path.join('/images/' + req.file.filename);
    var path2 = data.replace(/\\/g, '/');
    User.findOneAndUpdate({'email':req.user.email},{'profile_image':path2},{new:true},function(err,result){
        if(err) console.log(err);
        res.redirect('/profile');
    });
});

router.post('/save', unauthorised,function(req,res)
{
    var name = req.body.fullname;
    var about = req.body.about;
    console.log(req.body);
    User.findOneAndUpdate({email:req.user.email},{fullname:name,about:about},function(err,result){
        if(err) console.log(err);
        res.redirect('/profile');
    })
});

module.exports=router;