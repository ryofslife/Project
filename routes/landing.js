/* ---------- MODULES ---------- */
const express = require('express')
const axios = require('axios');

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

  // get visitor's location
  // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  // const ip = "76.10.46.67"
  const ip = req.ip
  const localIps = ['::1', '127.0.0.1', 'localhost']
  // console.log(ip)

  if (localIps.includes(ip)) {
    console.log('requesting from localIps')
    where = 'localhost';
  } else {
    const requestedLocation = await axios.get(`http://ip-api.com/json/${ip}`)
    const { data } = requestedLocation
    where = data.region;
  }

  if (req.params.sub == 'Location') {
    const posts = await Post.find({ hashtags: { $in: [`${where}`] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find({ hashtags: { $in: [`${where}`] } }).countDocuments();
    res.render('landingSubs.ejs', { posts: posts, sub: req.params.sub, location: where, postsNum: postsNum, csrfToken: req.csrfToken() })
  } else {
    const posts = await Post.find({ hiddenHashtags: { $in: [`#@${req.params.sub}`] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find({ hiddenHashtags: { $in: [`#@${req.params.sub}`] } }).countDocuments();
    res.render('landingSubs.ejs', { posts: posts, sub: req.params.sub, location: where, postsNum: postsNum, csrfToken: req.csrfToken() })
  }
});

module.exports = router;
