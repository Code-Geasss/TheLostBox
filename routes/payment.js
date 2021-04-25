const express = require('express');
const router = express.Router();
const passport = require('passport');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var async = require('async');
var nodemailer = require('nodemailer');

const bodyParser = require('body-parser');
const Razorpay = require("razorpay");
var User = require('../models/user');

const instance = new Razorpay({
    key_id : process.env.KEY_ID,
    key_secret : process.env.KEY_SECRET
});


router.get("/payments/:id",(req,res)=>{
    var rid= req.params.id;
    res.render("payment",{key: process.env.KEY_ID,rid:rid});
});

router.post("/api/payment/order",(req,res)=>{

    params = req.body;
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
    var response = {status : "failure"};
    var rid = req.body.rid;
    var amt = req.body.amt;
    var amt1 = amt*0.25;
    if(expectedSignature === req.body.razorpay_signature)
    {
        response = {status : "success"};
        User.findOneAndUpdate({"_id":rid},{$inc:{rewards:amt1}},{new:true},function(err,res){
            if(err) console.log(err);
            console.log(res);
            
        });
    }   
    res.send(response);
});

module.exports = router;