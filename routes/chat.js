const express = require('express');
const { isAuthenticated, unauthorised } = require('../config/auth_required');
const router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');


router.get('/chatlist/:senderId',isAuthenticated,async function(req,res){

    const senderId = req.params.senderId;
    let chatList1 = await Chat.distinct("receiver._id",{ 'sender._id': senderId })
    let chatList2 = await Chat.distinct("sender._id",{ 'receiver._id': senderId })
    let chatList = await chatList1.concat(chatList2);
    let distinctChatList = [...new Set(chatList)]
    User.find({ _id: { $in: distinctChatList } })
    .select('name email created updated ')
    .exec((err,data) => {
        if(err || !data){
            res.status(400).json({
                error: err
            })
        }
        //console.log(data);
        res.render('chatdef',{data:data});
    });
});

router.get('/chats/:senderId/:receiverId',isAuthenticated,function(req,res){
    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;

    Chat.find({ $or: [{ 'receiver._id': receiverId, 'sender._id': senderId },{ 'sender._id': receiverId, 'receiver._id': senderId }] }, 
    (err, chats) => {
        if(err || !chats){
            console.log("err");
        }
        else
        {
            //console.log(chats);
            //console.log(req.user);
            User.findById(receiverId,function(err,result){
                var data=result;
                //console.log(data);
                res.render('chat',{chats:chats,currentuser:req.user,receiveruser:data});
            })
           
        }           
    });
    
});


module.exports = router;