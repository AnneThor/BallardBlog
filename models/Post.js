const mongoose = require("mongoose");
const {Schema} = mongoose;



const postSchema = new Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  user: {type: String, required: true},
  date: Date,
  comments: {type: [Object],
             default: []},
  liked: {type: Boolean, default: false}
})

let Post = mongoose.model("Post", postSchema);

module.exports = Post;
