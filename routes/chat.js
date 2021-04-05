const express = require('express')
const router = express.Router();

const { getChats, chatList } = require('../controller/chat');

router.get('/chats/:senderId/:recieverId', getChats,function(req,res){
    res.render('chat');
});
router.get('/chatlist/:senderId', chatList);


module.exports = router;