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
  

//Create
router.post("/post/create",unauthorised,multer({ storage: storage }).single("photo"),(req, res, next) => {
    
    if(req.file == undefined){
        req.flash('error','Please upload an image');
        res.redirect("/post/create");
    }
    else{
    data=path.join('/images/' + req.file.filename);
    var path2 = data.replace(/\\/g, '/');
    var title = req.body.title;
    var description=req.body.description;
    var category=req.body.category;
    var location=req.body.location;
    var datetime=req.body.datetime;
    var color=req.body.color;
    var brand = req.body.brand;
    //console.log(req.body);

    var  newPost = new Post(
        {
            category_name:category,
            posts:[{
                title:title,
                category:category,
                description:description,
                location:location,
                datetime:datetime,
                color:color,
                brandname:brand,
                photo:path2,
                postedBy:req.user._id,
            }]         
        });
    var newPost1 = [{
        title:title,
        category:category,
        description:description,
        location:location,
        datetime:datetime,
        color:color,
        brandname:brand,
        photo:path2,
        postedBy:req.user._id,
    }];

    if(title.length == 0 || description.length == 0 || category.length == 0 || location.length == 0 ||
        datetime.length == 0 || color.length == 0 || brand.length == 0){
            console.log("err ke andar");
            req.flash('error', 'Please fill all the fields'); 
            res.redirect("/post/create");
    }
    else{
       Post.find({"category_name":category},function(err,result){
           if(err) console.log(err);
           if(result.length!=0){
               Post.updateOne({"category_name":category},{$push:{"posts":newPost1}},function(err,doc){
                   if(err){
                       console.log(err);
                   }
                   else{
                       res.redirect('/');
                   }
               })
           }else{
               newPost.save(function(err,result){
                   if(err) console.log(err);
                   else{
                    req.flash('success', 'Sucessfully added Post');
                    res.redirect("/");
                   }
               });
           }
       });
    }
}
    
});


//Edit
router.put('/post/:name/:id',unauthorised,multer({ storage: storage }).single("photo"),(req, res, next) => {
    var successMsg = req.flash('success')[0];
    var postId = req.params.id;
    console.log(req.body);
    if(req.file == undefined){
        req.flash('error','Please upload an image');
        res.redirect("/post/${req.params.name}/${req.params.id}/edit");
    }
    else{

        data=path.join('/images/' + req.file.filename);
        var path2 = data.replace(/\\/g, '/');
        var title = req.body.title;
        var description=req.body.description;
        var category=req.params.name;
        var location=req.body.location;
        var datetime=req.body.datetime;
        var color=req.body.color;
        var brand = req.body.brand;

        if(title.length == 0 || description.length == 0 || category.length == 0 || location.length == 0
            || datetime.length == 0|| color.length == 0 || brand.length == 0){
                console.log("err ke andar");
                req.flash('error', 'Please fill all the fields'); 
                res.redirect("/post/${req.params.name}/${req.params.id}/edit");
        }
        else{
            Post.findOneAndUpdate({ "posts._id": postId },{$set:{ 
                'posts.$.title': title,
                'posts.$.category': category,
                'posts.$.description': description,
                'posts.$.location': location,
                'posts.$.photo': path2,
                'posts.$.brandname': brand,
                'posts.$.color': color,
                'posts.$.datetime': datetime,
                'posts.$.postedBy': req.user._id,
                'posts.$.updated': Date.now(),
             }},
            {new:true},function(err,post){
                if(err){
                    res.redirect("/post/${req.params.id}/edit");  
                }
                else{

                    req.flash('success', 'Sucessfully Updated post'); 
                    res.redirect("/");
                }
            });
        }
    }
})

router.get('/post/create',isAuthenticated,function(req,res){
    var errMsg = req.flash('error')[0];
    //console.log("1");
    res.render('upload',{currentUser: req.user,errMsg: errMsg, noMessages: !errMsg });
});

router.get('/post/:name/:id/edit',isAuthenticated,function(req,res){
    var errMsg = req.flash('error')[0];
    var postId = req.params.id;
    //console.log("1");
    Post.find({ "posts._id" : postId},{posts:{ $elemMatch:{_id:postId}}},function(err,result){
        if(err)
        {
            //res.redirect('/box');
        }
        else{
            var data=result[0];
            //console.log(data);
            res.render("edit",{post:data,errMsg: errMsg, noMessages: !errMsg})
        }
    })
});

//Delete
router.delete('/post/:id',isAuthenticated,function(req,res){
    Post.findOneAndUpdate({"posts._id" : req.params.id},{$pull:{"posts":{_id:req.params.id}}},function(err){
        if(err){
            res.redirect('/');
        }
        else{
            console.log("deleted");
            req.flash('success','Post Deleted sucessfully');
            res.redirect("/");
        }
    });
});

// router.get('/box',isAuthenticated,function(req,res){
//     Post.find({},function(err,allposts){
//         if(err)
//         {
//             console.log(err);
//         }
//         else{
//             console.log(allposts);
//             //res.render('thebox',{posts:allposts,currentUser:req.user});
//         }
//     });
// });

router.get('/box/:id',isAuthenticated,function(req,res){
    var postid=req.params.id;
    var currentUser = req.user;
    
    Post.find({ "posts._id" : postid},{posts:{ $elemMatch:{_id:postid}}})
    .populate('posts.postedBy')
    .exec(function(err,result){
        if(err){
            console.log(err);
        }
        else
        {
            console.log(result);
            var data = result[0]; 
            // console.log(data.posts[0].postedBy); 
            res.render("item", {data: data,currentUser: currentUser});
        }
    });
});


//router.put("/post/:postId", isAuthenticated , isPoster, updatePost);

module.exports = router;