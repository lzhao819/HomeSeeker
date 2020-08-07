let express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
	flash      = require("connect-flash"),
	passport   = require("passport"),
    LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	House      = require("./models/house"),
	Comment    = require("./models/comment"),
	User       = require("./models/user"),
	seedDB     = require("./seeds");

//requiring routes
let commentRoutes = require("./routes/comments"),
    houseRoutes = require("./routes/houses"),
	indexRoutes = require("./routes/index");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/home_seeker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended :true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({ 
    secret: "This is the secret!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/houses", houseRoutes);
app.use("/houses/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log('The HomeSeeker Server Has Started on Port 3000'); 
});