const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  authorName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  htmlCode: {
    type: String
  },
  width: {
    type: String
  },
  height: {
    type: String
  },
  source: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  hashtags: {
    type: Array
  },
  hiddenHashtags: {
    type: Array
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

module.exports = PostSchema;
