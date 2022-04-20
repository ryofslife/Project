const mongoose = require("mongoose");

const HashtagSchema = new mongoose.Schema({
  hashtagName: {
    type: String,
    required: true
  },
  users: {
    type: Array,
    required: true
  }
});

module.exports = HashtagSchema;
