const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({

    category_name:{
        type:String,
        required:true
    },
    posts:[{
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        photo: {
            type:String
        },
        color:{
            type:String,
            required:true,        
        },
        brandname:{
            type:String,
            required:true,
        },
        category: {
            type: String,
            required: true
        },
        cost : {
            type : Number,
        },
        paymentDone : {
            type : Boolean,
        },
        postedBy: {
            type: ObjectId,
            ref: "User"
        },
        created: {
            type: Date,
            default: Date.now
        },
        updated: Date
    }],
    
});

module.exports = mongoose.model("Post", postSchema);