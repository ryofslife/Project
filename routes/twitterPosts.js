/* ---------- MODULES ---------- */
const express = require('express')
const authObj = require('../middleware/auth');

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
// const connection = require('../config/database.js');
// const Post = connection.models.Post;
// const Comment = connection.models.Comment;
// const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
// Serve the twitterPostsposts.ejs
router.get('/', authObj.isLoggedIn, async (req, res, next) => {
    res.render('twitterPosts.ejs', { name: req.user.username })
});

module.exports = router;
