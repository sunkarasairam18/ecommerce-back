const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
        trim: true        
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,        
    },
    hash_password:{
        type: String,
        required: true,
        trim: true
    },
    role:{
        type: String,
        enum: ['user','admin'],
        default:'user'
    },
    contactNumber:{
        type: String,
        required: true,
    },
    profilePicture:{
        type: String
    }

},{timestamps:true});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id,email: this.email,role:this.role},config.get("auth_jwtPrivateKey"));
    return token;
};

userSchema.methods.Authenticate = async function(password){
   return await bcrypt.compare(password.trim(),this.hash_password);
};


const validateUser = (body)=>{
    const schema = Joi.object({
        fullName: Joi.string().required(),
        userName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().required(),
        contactNumber: Joi.string().length(10).required(),

    });

    return schema.validate(body);
};

exports.User = mongoose.model("User",userSchema);
exports.validateUser = validateUser;