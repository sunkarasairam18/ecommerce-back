exports.admin = function(req,res,next){
    if(req.user.role && req.user.role === "admin") next();
    else return res.status(403).send('Access denied.');
}