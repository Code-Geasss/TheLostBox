const express = require('express');
const router = express.Router();
const passport = require('passport');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var async = require('async');
var nodemailer = require('nodemailer');

const bodyParser = require('body-parser');
const Razorpay = require("razorpay");

// const instance = new Razorpay({
//     key_id : process.env.KEY_ID,
//     key_secret : process.env.KEY_SECRET
// });


router.get("/payments",(req,res)=>{
    res.render("payment",{key: process.env.KEY_ID});
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
    if(expectedSignature === req.body.razorpay_signature)
        response = {status : "success"};
    res.send(response);
});

module.exports = router;