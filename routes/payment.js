const express = require('express');
const router = express.Router();
var crypto = require('crypto');

const { isAuthenticated, unauthorised } = require('../config/auth_required');

const bodyParser = require('body-parser');
const Razorpay = require("razorpay");
var User = require('../models/user');
const Post = require('../models/post');

const instance = new Razorpay({
    key_id : process.env.KEY_ID,
    key_secret : process.env.KEY_SECRET
});


router.get("/payments/:id/:id2",(req,res)=>{
    var rid= req.params.id;
    var postId = req.params.id2;
    console.log(rid);
    console.log(postId);

    Post.findOne({"posts._id": postId},{posts:{ $elemMatch:{_id:postId}}},function(err,result){
           if(err){
               console.log(err);
           }
           else{    
               var payAmount = result.posts[0].cost;
               res.render("payment",{key: process.env.KEY_ID,rid:rid,payAmount:payAmount,currentUser: req.user,pid:postId});
               
           }
       });    

});

router.post("/api/payment/order",(req,res)=>{

    params = req.body;
    console.log(params);
    instance.orders
        .create(params)
        .then((data)=>{
            res.send({sub:data, status:"success"});
        })
        .catch((error)=>{
            res.send({sub:error,status:"failed"});
        });
});

router.post("/api/payment/verify",(req,res)=>{
    body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

    var expectedSignature = crypto
        .createHmac("sha256",process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");
    console.log("sig" + req.body.razorpay_signature);
    console.log("sig" + expectedSignature);
    console.log("hii inside payment");
    var response = {status : "failure"};
    var rid = req.body.rid;
    var pid = req.body.pid;
    var amt = req.body.amt;
    var amt1 = ParseInt(amt*0.75);


        console.log("doned one doned one");
  if(expectedSignature === req.body.razorpay_signature)
    {
        response = {status : "success"};
        User.findOneAndUpdate({"_id":rid},{$inc:{rewards:amt1}},{new:true},function(err,res){
            if(err) console.log(err);
            console.log(res);

        });

        console.log(pid);
        Post.findOneAndUpdate({ "posts._id": pid },{$set:{ 
            'posts.$.paymentDone': true,
        }},
        {new:true},function(err,post){
                if(err){
                    console.log(err);
                    // It is coming here from flask server.
                }
                else{
                console.log(post);
                res.redirect('/'); //this to redirect to the page from where u came.
                }
        });
    }
    res.send(response);
    res.redirect('/');

});

module.exports = router;