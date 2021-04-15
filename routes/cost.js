var express = require('express');
const router = express.Router();
const request = require('request');

router.get('/cost/:title',function(req,res){

    var title = req.params.title;
    // console.log(title);

    request('http://127.0.0.1:3000/home/${title}', function (error, response, body) {
        res.send(body); //Display the response on the website
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the data received
        var data = body;
        res.render("cost", {data: data});
      }); 
});

module.exports = router;