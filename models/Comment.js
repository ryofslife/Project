const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postTitle: {
    type: String,
    required: true
  },
  author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  authorName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

module.exports = CommentSchema;
