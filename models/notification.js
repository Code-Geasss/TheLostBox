const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const notificationSchema = new mongoose.Schema({

    id : {
        type : String,
        required : true
    },
    senderId : {
        type : ObjectId,
        ref : "User",
    },
    receiverID : {
        type : ObjectId,
        ref : "User",
    },
    brandName : {
        type : String,
        required : true
    },
    description:{
        type:String,
        required:true
    },
    isAccept : {
        type : Number,
        required : true
    }
},   
{timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);