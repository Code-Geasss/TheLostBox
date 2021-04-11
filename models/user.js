const mongoose = require('mongoose');
const { v1: uuidv1 } = require('uuid');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;


const userSchema = new mongoose.Schema({
    guid:{
        type:String,
        default:null
      },
    fullname: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        //required: true,
      },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    profile_image:{
        // User Image
        type: String,
        default:"https://image.flaticon.com/icons/svg/236/236831.svg",
      },
    about: {
        type: String,
        trim: true  
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

//virtual field
userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
  };

  userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
  };

module.exports = mongoose.model("User", userSchema);