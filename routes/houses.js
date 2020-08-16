let express = require("express");
let router  = express.Router();
let House = require("../models/house");
let middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all houses
router.get("/", function(req, res){
	//get all houses from db
	House.find({}, function(err, allHouses){
		if(err){
			console.log(err);
		}else{
			res.render("houses/index",{houses:allHouses, page: 'houses'});
		}
	});
	
}); 
//CREATE - add new house to DB 
router.post("/", middleware.isLoggedIn, function(req,res){
	//get data from form
	let name = req.body.name;
	let image = req.body.image;
	let description = req.body.description;
	let price = req.body.price;
	let author = {
        id: req.user._id,
        username: req.user.username
	}
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
		  req.flash('error', 'Invalid address');
		  return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		let newHouse = {name:name, image:image, description:description, price:price, author:author, location: location, lat: lat, lng: lng};
		//creat new house and save to database
		House.create(newHouse, function(err, newlyCreated){
			if(err){
				req.flash("error",err.message);
			}else{
				req.flash("success","Successfully added new house!");
				//redirect to houses page
				res.redirect("/houses");
			}
		});
	});
});

//NEW - show form to create new house 
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("houses/new"); 
});
//SHOW - shows more info about one house
router.get("/:id",function(req, res){
	//find the house with privided ID
	House.findById(req.params.id).populate("comments").exec(function(err, foundHouse){
		if(err){
			console.log(err);
		}else{
			//render show templete with that house
			res.render("houses/show", {house:foundHouse});
		}
	});
});

//EDIT - houses info
router.get("/:id/edit", middleware.checkHouseOwnership, function(req, res){
    House.findById(req.params.id, function(err, foundHouse){
        res.render("houses/edit", {house: foundHouse});
    });
});

//UPDATE
router.put("/:id",middleware.checkHouseOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
		  req.flash('error', err.message);
		  return res.redirect('back');
		}
		req.body.house.lat = data[0].latitude;
		req.body.house.lng = data[0].longitude;
		req.body.house.location = data[0].formattedAddress;
		// find and update the correct house
		House.findByIdAndUpdate(req.params.id, req.body.house, function(err, updatedHouse){
		if(err){
			res.redirect("/houses");
		} else {
			req.flash("success","House info updated!");
			//redirect somewhere(show page)
			res.redirect("/houses/" + req.params.id);
		}
		});
	});
});

//DESTROY
router.delete("/:id",middleware.checkHouseOwnership, function(req, res){
   House.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/houses");
      } else {
		  req.flash("success","House deleted!");
          res.redirect("/houses");
      }
   });
});
// Delete/destroy Campground
// router.delete("/:id",async(req, res) => {
//   try {
//     let foundHouse = await House.findById(req.params.id);
//     await foundHouse.remove();
//     res.redirect("/houses");
//   } catch (error) {
//     console.log(error.message);
//     res.redirect("/houses");
//   }
// });

module.exports = router;