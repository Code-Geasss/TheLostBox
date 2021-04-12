
var express = require('express');
const router = express.Router();
var empModel = require('../models/employee');
var employee = empModel.find({});

router.get("/form",function(req,res,next){
    employee.exec(function(err,data){
        if(err) throw err;
        res.render('form',{title : 'Employee Records', records:data});
    });
});

router.post("/form",function(req,res,next){

    var empDetails = new empModel({
        name: req.body.uname,
        email: req.body.email,
        etype: req.body.emptype
    });

    console.log(empDetails);
    empDetails.save(function(err,res1){
        if(err) throw err;
        employee.exec(function(err,data){
            if(err) throw err;
            res.render('form',{title : 'Employee Records', records:data});
        });
    });

    
});

module.exports = router;
