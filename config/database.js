const mongoose = require('mongoose');
const user = require('../models/User.js');
const location = require('../models/Location.js');
const post = require('../models/Post.js');
const comment = require('../models/Comment.js');
const conversation = require('../models/Conversation.js');
const message = require('../models/Message.js');
const hashtag = require('../models/Hashtag.js');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */

const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// mongoose.model(<Collectionname>, <CollectionSchema>)
// collectionname will be uncapitalized and pluralize
const User = connection.model('User', user);
const Location = connection.model('Location', location);
const Post = connection.model('Post', post);
const Comment = connection.model('Comment', comment);
const Conversation = connection.model('Conversation', conversation);
const Message = connection.model('Message', message);
const Hashtag = connection.model('Hashtag', hashtag);

// Expose the connection
module.exports = connection;
