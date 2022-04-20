const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  visitedAt: {
    type: String
  },
  country: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  }
});

module.exports = LocationSchema;
