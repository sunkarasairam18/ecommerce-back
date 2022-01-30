module.exports = function(req,res,next){
    if(req.user.role && req.user.role === "admin") next();
    return res.status(403).send('Access denied.');
}