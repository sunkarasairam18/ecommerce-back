exports.user = function(req,res,next){
    if(req.user.role && req.user.role === "user") next();
    else return res.status(403).send('Access denied.');
}