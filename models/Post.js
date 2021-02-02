const mongoose = require("mongoose");
const {Schema} = mongoose;

const commentSchema = new Schema({
  body: {type: String, required: true},
  user: {type: String, required: true},
  date: Date
  })

const postSchema = new Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  user: {type: String, required: true},
  date: Date,
  comments: {type: [commentSchema],
             default: []},
  liked: {type: Boolean, default: false}
})

let Comment = mongoose.model("Comment", commentSchema);
let Post = mongoose.model("Post", postSchema);


//   user: "", //but have to add logic to verify the user before...
//   //functionality will only show to a logged in user
//   //so no limit is needed here necessarily...
//   //website only shows view mode to non logged in user
// })
//
// //how to search by a certain field (probably user in this case)
// //we can use find one because the username is unique
// //can also try User.exists() to check if there is such a user
// User.findOne({name: "username"}, function(err,data){
//   if(err){console.log(err)};
//   done(null, data);
// })
//
// //User: _id, name (unique, required), password, status (required, default logout)
// //Posts: _id, date (new date at time of creation), user: required (must be a user that exists), body: String
// //Comments: exist as an array of posts (neesd to be like that so if someone deletes a post they will remove also all the comements)

module.exports = Post;
