const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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
    category: {
        type: String,
        required: true
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
});

module.exports = mongoose.model("Post", postSchema);