const mongoose = require("mongoose");

// The hash and salt are derived from the user's given password when they register.
const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    // admin: Boolean
});

module.exports = UserSchema;
