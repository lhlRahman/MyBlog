const mongoose = require("mongoose");
const {Schema, model} = mongoose;
const PostSchema = new Schema({
  title:String,
  summary:String,
  content:String,
  cover:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const Post = model('Post', PostSchema);

exports.Post = Post;