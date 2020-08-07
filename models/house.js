const mongoose = require('mongoose');
const Comment = require('./comment');

//SCHEMA SETUP
let houseSchema = new mongoose.Schema({
	name:String,
	image:String,
	price:String,
	description:String,
	author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
     	 username: String
   	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

// houseSchema.pre('remove', async function() {
// 	await Comment.remove({
// 		_id: {
// 			$in: this.comments
// 		}
// 	});
// });

module.exports = mongoose.model("House", houseSchema);