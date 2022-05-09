/* ---------- MODULES ---------- */
const authObj = require('../middleware/auth');
const express = require('express');
const passport = require('passport');
const _ = require('lodash')
const csrf = require('csurf')

/* ---------- CLASSES & INSTANCES ---------- */
//creating router object
const router = express.Router();
const csrfProtection = csrf();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(csrfProtection);
const connection = require('../config/database.js');
const Post = connection.models.Post;
const Comment = connection.models.Comment;
const Conversation = connection.models.Conversation;
const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
// for signing up users
router.use('/signup', require('./signup.js'));

// for serving landing pages
router.use('/landing', require('./landing.js'));

// routes for posts
router.use('/posts', require('./posts.js'));

// routes for comments
router.use('/comments', require('./comments.js'));

// routes for messages
router.use('/conversations', require('./conversations.js'));

// routes for hashtags
router.use('/hashtags', require('./hashtags.js'));

// routes for youtubePosts
router.use('/youtubePosts', require('./youtubePosts.js'));

// routes for instagramPosts
router.use('/instagramPosts', require('./instagramPosts.js'));

// routes for facebookPosts
router.use('/facebookPosts', require('./facebookPosts.js'));

// With the middleware, if the user is not authenticated, they will be redirected to the front landing page. Called automatically by opening landing.js if already logged in.
// The default is set to Home>All once user is logged in
router.get('/', authObj.isLoggedIn, (req, res) => {
    res.redirect('/login-success');
});

// FOR VISITOR
// Called by popup login form inside landing.ejs in case if not already logged in.
router.post('/login', passport.authenticate('local', {successRedirect: '/login-success', failureRedirect: '/login-failure'}));

// routes for login success
router.get('/login-success', authObj.isLoggedIn, async (req, res, next) => {
    // for displaying post based on postTemplate/server.js, Post needs to be imported, function needs to be async
    // populate function is connected to 'ref' inside mongoose models
    const posts = await Post.find({ hiddenHashtags: { $in: ['#@Facebook', '#@Instagram', '#@Posts', '#@Youtube'] } }).populate('comments').sort({ createdAt: 'desc' })
    const pinnedPosts = await Post.find({ hiddenHashtags: { $in: ['#@pinnedPosts'] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find().countDocuments();

    res.render('home.ejs', { name: req.user.username, post: new Post(), posts: posts, pinnedPosts: pinnedPosts, postsNum: postsNum, csrfToken: req.csrfToken() })
});
// routes for login failure
router.get('/login-failure', async (req, res, next) => {
    const posts = await Post.find({ hiddenHashtags: { $in: ['#@Facebook', '#@Instagram', '#@Posts', '#@Youtube'] } }).populate('comments').sort({ createdAt: 'desc' })
    const pinnedPosts = await Post.find({ hiddenHashtags: { $in: ['#@pinnedPosts'] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find().countDocuments();

    res.render('landing.ejs', { posts: posts, pinnedPosts: pinnedPosts, postsNum: postsNum, csrfToken: req.csrfToken() })
});

// users need to be logged in in order to be authenticated to accesss the route
router.get('/protected-route/:subDashboard', async (req, res, next) => {

    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {
        // for displaying post based on postTemplate/server.js and frontTemplate/routes/posts.js, Post needs to be imported, function needs to be async
        const posts = await Post.find({ authorName: req.user.username }).sort({ createdAt: 'desc' })
        const postsNum = await Post.find({ authorName: req.user.username }).countDocuments();
        const comments = await Comment.find({ authorName: req.user.username }).sort({ createdAt: 'desc' })

        // for listing messages, find one with 'req.user.username' in 'members' and list them in 'alphabetical order'
        const conversations = await Conversation.find({ members: req.user.username })
        const convNum = await Conversation.find({ members: req.user.username }).countDocuments();

        // for listing hashTags
        const hashtags = await Hashtag.find({ users: { $in: [req.user.username] } });

        res.render(`dashboard${req.params.subDashboard}.ejs`, { name: req.user.username, posts: posts, postsNum: postsNum, comments: comments, conversations: conversations, convNum: convNum, hashtags: hashtags, csrfToken: req.csrfToken() })
    } else {
        const posts = await Post.find().populate('comments').sort({ createdAt: 'desc' })
        const postsNum = await Post.find().countDocuments();

        res.render('landing.ejs', { posts: posts, postsNum: postsNum, csrfToken: req.csrfToken() })
    }
});

// routes for logging out
router.get('/logout', authObj.isAuthenticated, (req, res) => {
    console.log(`bye ${req.user.username}`)
    req.logout();
    // redirected to GET method by default
    res.redirect('/');
});

module.exports = router;
