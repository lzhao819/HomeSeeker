let express = require("express");
let router  = express.Router();
let passport = require("passport");
let User = require("../models/user");

//root route
router.get("/", function(req, res){
	res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
			req.flash("error", error.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
			req.flash("success", "Hi, " + user.username + "welcome to HomeSeeker!");
            res.redirect("/houses"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/houses",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Successfully logged you out!");
   res.redirect("/houses");
});

module.exports = router;