
var express = require('express');
var router = express.Router();
var empModel = require('../models/employee');
var employee = empModel.find({});

router.get('/form',function(req,res,next){
    employee.exec(function(err,data){
        if(err) throw err;
        res.render('form',{title : 'Employee Records', recrods:data});
    });
});

module.exports = router;
