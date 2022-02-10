const config = require('config');
const {auth} = require('../middleware/auth');
const {admin} = require('../middleware/admin');
const _ = require('lodash');
const express = require("express");
const router = express.Router();
const {User,validateUser} = require('../models/auth');
const bcrypt = require("bcrypt");

if(!config.get("auth_jwtPrivateKey")){
    console.log("JWT Private Key is not defined");
    process.exit(0);
}

router.post('/signin',async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).send("Invalid Email or password");  //The request could not be understood by the server due to malformed syntax
    }
    let user = await User.findOne({email: email});
    if(user && user.role === 'admin'){
        let verified = await user.Authenticate(password);
        if(verified){
            const token = user.generateAuthToken();
            // res.header("Access-Control-Allow-Origin","x-auth-token",token).status(200).send(_.pick(user,['_id','userName','email','role'])); //ok status code

            res.header("x-auth-token",token).status(200).send(_.pick(user,['_id','userName','email','role'])); //ok status code
        }else{
            return res.status(400).send("Invalid Email or password");  //The request could not be understood by the server due to malformed syntax
        }
    }else{
        return res.status(400).send("Invalid Email or password");  //The request could not be understood by the server due to malformed syntax
    }
});

router.post("/signup",async (req,res)=>{   //creating a user
    const {error} = validateUser(req.body);
    if(error){
        return res.status(403).send(error.details[0].message);   //Forbidden request
    }
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(403).send(`${req.body.role} already registered`);   //Forbidden request
    const {fullName,userName,email,password,contactNumber,role} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password.trim(),salt);
    let object = {
        fullName,
        userName,
        email,
        hash_password,
        contactNumber,
        role
    }
    
    user = new User(object);
    user.save((err,result)=>{
        if(err){
            return res.status(500).send(err); //Internal server eroor
        }
        if(result){
            const token = user.generateAuthToken();
            return res.header("x-auth-token",token).status(201).send(_.pick(user,['_id','userName','email','role'])); //Created
        }
    });


});

router.get('/profile',auth,async (req,res)=>{
    try{
        let user = await User.findOne({email: req.user.email}).select({_id:1,userName:1,email:1,role:1});
        if(user){
            res.status(200).json(user);
        }
    }catch(err){
        console.log("Error ",err);
        res.status(400).send("err ");
    }
    
});

router.get('/list',[auth,admin],(req,res)=>{
    res.status(200).json(req.user);
});



module.exports.authRouter = router;

