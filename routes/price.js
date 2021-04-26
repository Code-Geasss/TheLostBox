var express = require('express');
const router = express.Router();
const request = require('request');

const Post = require('../models/post');
const { isAuthenticated, unauthorised } = require('../config/auth_required');

router.get('/price/:title/:id',function(req,res){

    var title = req.params.title;
    var postId = req.params.id;
    console.log(postId);

    title = title.replace(/ /g, '%20');
    console.log(title);

    request('http://127.0.0.1:3000/home/'+title, function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('Price:', body); // Print the data received
        var data = body;
        console.log(data);

        data = data.replace(/,/g, "");
        data1 = parseInt(data);

        Post.findOneAndUpdate({ "posts._id": postId },{$set:{ 
                'posts.$.cost': data1,
          }},
           {new:true},function(err,post){
                if(err){
                    console.log(err);
                    // It is coming here from flask server.
                }
                else{
                   
                   res.redirect(req.get('referer')); //this to redirect to the page from where u came.
                }
            });
      }); 
});

module.exports = router;