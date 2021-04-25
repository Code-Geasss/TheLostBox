var express = require('express');
const router = express.Router();
const request = require('request');

const Post = require('../models/post');

router.get('/price/:title/:id',function(req,res){

    var title = req.params.title;
    var postId = req.params.id;
    console.log(postId);

    request('http://127.0.0.1:3000/home/'+title, function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('Price:', body); // Print the data received
        var data = body;
        console.log(data);

        Post.findOneAndUpdate({ "posts._id": postId },{$set:{ 
                'posts.$.cost': data,
          }},
           {new:true},function(err,post){
                if(err){
                    // It is coming here from flask server.
                    res.redirect("/post/${req.params.id}/edit");  
                }
                else{
                   
                    res.redirect("/");
                }
            });
      }); 
});

module.exports = router;