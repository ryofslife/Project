const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
    },
    message: {
      type: String,
    },
  }
);

module.exports = MessageSchema;
