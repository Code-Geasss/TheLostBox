var unauthorised = (req,res,next) => {
    if(req.user) return next();
    else res.send("You cannot access this route");
}

var isAuthenticated = (req,res,next) => {
    if(req.user) return next();
    return res.redirect('/LogIn');
}

module.exports = {
    unauthorised,
    isAuthenticated
}