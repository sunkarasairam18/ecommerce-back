const config = require('config');
const {auth} = require('../middleware/auth');
const { user } = require('../middleware/user');
const {admin} = require('../middleware/admin');
const _ = require('lodash');
const express = require("express");
const router = express.Router();
const {User,validateUser} = require('../models/auth');
const bcrypt = require("bcrypt");

const { Cart } = require('../models/cart');

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

router.post('/account/update',[auth, user], async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(user){

            const {fullName,userName,email,contactNumber,oldPwd,newPwd} = req.body;
            let condition = {"user": req.user._id},update;
            if(newPwd){
                
                let verified = await user.Authenticate(oldPwd);
                if(verified){
                    // const {fullName,userName,email,password,contactNumber,role} = req.body;
                    const salt = await bcrypt.genSalt(10);
                    const hash_password = await bcrypt.hash(newPwd.trim(),salt);
                    
                    update = {
                        "$set":{
                            "fullName": fullName,
                            "userName": userName,
                            "email": email,
                            "contactNumber": contactNumber,
                            "hash_password": hash_password
                        }
                    };
                    
                }else return res.status(403).send("Forbidden"); //The server understood the request but refuses to authorize it.
            }else{
                update = {
                    "$set":{
                        "fullName": fullName,
                        "userName": userName,
                        "email": email,
                        "contactNumber": contactNumber,
                    }
                };
            }
            User.findOneAndUpdate(condition,update,{new: true},(error,user)=>{
                if(error) return res.status(400).json({error});
                if(user){                    
                    const token = user.generateAuthToken();
                    let updated = {
                        _id: user._id,
                        userName: user.userName,
                        email: user.email,
                        role: user.role,
                        token: token
                    };
                    return res.status(200).send(updated);
                }
            });
    
        }else return res.status(404).send("User not found");

    }catch(err){
        return res.status(500).send(err); //Internal server error
    }
});

router.get('/fullprofile',[auth,user],async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        if(user){
            return res.status(200).send(user);
            
        }else return res.status(404).send("User not found");
    }catch(err){
        return res.status(500).send(err) //Internal Server error
    }
});

router.post('/role/signin',async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).send("Invalid Email or password");  //The request could not be understood by the server due to malformed syntax
    }
    try{
        let user = await User.findOne({email: email});
        if(user && user.role === 'user'){
            let verified = await user.Authenticate(password);
            if(verified){
                const token = user.generateAuthToken();
                // res.header("Access-Control-Allow-Origin","x-auth-token",token).status(200).send(_.pick(user,['_id','userName','email','role'])); //ok status code
                let final = {};
                let cart = await Cart.findOne({user: user._id}).select({cartItems: 1});
                final = {...user._doc,'cartCount': cart.cartItems.length};
                res.header("x-auth-token",token).status(200).send(_.pick(final,['_id','userName','email','role','cartCount'])); //ok status code
                
            }else{
                return res.status(401).send("Unauthorized");  
            }
        }else{
            return res.status(403).send("Forbidden");  //The server understood the request, but is refusing to fulfill it
        }
    }catch(err){
        return res.status(500).send("Internal Server Error"); //Internal server error
    }
});

router.post("/signup",async (req,res)=>{   //creating a user
    const {error} = validateUser(req.body);
    if(error){
        return res.status(403).send(error.details[0].message);   //Forbidden request
    }
    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(403).send(`existed`);   //Forbidden request
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
            let final = {};
            let cart = await Cart.findOne({user: req.user._id}).select({cartItems: 1});
            final = {...user._doc,'cartCount': cart?cart.cartItems.length:0};
            // console.log(final,cart.cartItems.length);
            res.status(200).json(final);
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

