const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  members: {
    type: Array
  },
  messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }]
});

module.exports = ConversationSchema;
