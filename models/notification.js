const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const notificationSchema = new mongoose.Schema({

    id : {
        type : String,
        required : true
    },
    senderId : {
        type : String,
        required : true
    },
    receiverID : {
        type : String,
        required : true
    },
    brandName : {
        type : String,
        required : true
    },
    isAccept : {
        type : Boolean,
        required : true
    }
},   
{timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);