/* ---------- MODULES ---------- */
const express = require('express')

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const connection = require('../config/database.js');
const Post = connection.models.Post;
const Comment = connection.models.Comment;
const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
// Serve the landingSubs.ejs
router.get('/:sub', async (req, res, next) => {
    const posts = await Post.find({ hiddenHashtags: { $in: [`#@${req.params.sub}`] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find().countDocuments();

    res.render('landingSubs.ejs', { posts: posts, sub: req.params.sub, postsNum: postsNum, csrfToken: req.csrfToken() })
});

module.exports = router;
