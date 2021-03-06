const jwt = require('jsonwebtoken');
const config = require('config');

exports.auth = function(req,res,next){
    const token = req.header('x-auth-token');    
    if(!token){
        // console.log("not provided",req.headers);
        return res.status(401).send("Access denied.No token provided"); //Unauthorized
    }
    try{
        const decoded = jwt.verify(token,config.get("auth_jwtPrivateKey"));
        req.user = decoded;
        next();
    }catch(err){
        return res.status(400).send("Invalid token.");
    }
}

