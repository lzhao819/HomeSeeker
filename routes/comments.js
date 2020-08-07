let express = require("express");
let router  = express.Router({mergeParams: true});
let House = require("../models/house");
let Comment = require("../models/comment");
let middleware = require("../middleware");

//NEW - comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find house by id
    House.findById(req.params.id, function(err, house){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {house: house});
        }
    })
});

//CREATE - comment
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup house using ID 
   House.findById(req.params.id, function(err, house){
       if(err){
           console.log(err);
           res.redirect("/houses");
       } else {
			Comment.create(req.body.comment, function(err, comment){
			   if(err){
				   req.flash("error","Oops, something went wrong!");
			   } else {
				   //add username and id to comment
				   comment.author.id = req.user._id;
				   comment.author.username = req.user.username;
				   //save comment
				   comment.save();
				   house.comments.push(comment);
				   house.save();
				   req.flash("success","Successfully added comment!");
				   res.redirect('/houses/' + house._id);
			   }
			});
       }
   });
});

//EDIT - comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {house_id: req.params.id, comment: foundComment});
      }
   });
});

//UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
		  req.flash("success","Comment updated!");
          res.redirect("/houses/" + req.params.id );
      }
   });
});

//DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
		   req.flash("success","Comment deleted!");
           res.redirect("/houses/" + req.params.id);
       }
    });
});

module.exports = router;