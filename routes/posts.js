/* ---------- MODULES ---------- */
const express = require('express')
const authObj = require('../middleware/auth');

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const connection = require('../config/database.js');
const Post = connection.models.Post;
const Comment = connection.models.Comment;
const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
// Serve the posts.ejs
router.get('/', authObj.isLoggedIn, async (req, res, next) => {
    const posts = await Post.find({ hiddenHashtags: { $in: ['#@Post'] } }).populate('comments').sort({ createdAt: 'desc' });
    res.render('posts.ejs', { name: req.user.username, post: new Post(), posts: posts, csrfToken: req.csrfToken(), message: req.flash('message') })
});

// Create a post.
router.post('/', authObj.isAuthenticated, async (req, res, next) => {
    // for hashtags
    if (req.body.hashtags) {
      var hashtagArray = findHashtags(req.body.hashtags)
      for(var i=0; i < hashtagArray.length; i++) {
       saveHashtag(hashtagArray[i], req.user.username)
      }
    }
    // req contains user information based on 'User' model in addition to body: author: req.user._id, title: req.body.title, content: req.body.content
    req.post = new Post();
    next()
}, savePostAndRedirect('/posts'));

// Editing a post
router.put('/edit/:id', authObj.isAuthenticated, async (req, res, next) => {
  // :id and req.params.id is the  _id (ObjectId) assigned to each Post
  // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name , then the "name" from the URL path wil be available as req.params.name .
  req.post = await Post.findById(req.params.id);

  if (req.post.authorName == req.user.username){
    next();
  } else {
    console.log('unauthorized access to editing posts')
    return res.redirect('/protected-route')
  }
}, savePostAndRedirect('/protected-route'));

// Deleting a post
router.delete('/delete/:id', authObj.isAuthenticated, (req, res) => {
  Post.find( { _id: req.params.id }, async function (err, requestedPost) {
    if (requestedPost[0].authorName == req.user.username){
      await Post.findByIdAndDelete(req.params.id);
      return res.redirect('/protected-route')
    } else {
      console.log('unauthorized access to deleting posts')
      return res.redirect('/protected-route')
    }
  });
});

function savePostAndRedirect(path) {
  return async (req, res) => {
    let post = req.post
    // keep the post if it came form edit route
    if (path == '/posts') {
      post.author = req.user._id,
      post.authorName = req.user.username,
      post.title = req.body.title,
      post.content = req.body.content
      if (req.body.hashtags) {
        post.hashtags = findHashtags(req.body.hashtags)
      }
      post.hiddenHashtags = req.body.hiddenHashtag
    } else {
      post.title = req.body.title,
      post.content = req.body.content
    }
    try {
      req.flash('message', 'The post was submitted successfully.');
      post = await post.save()
      return res.redirect(`${path}`)
    } catch (e) {
      return res.redirect(`${path}`)
    }
  }
};
function saveHashtag(hashtag, user) {
  Hashtag.findOne({ hashtagName: hashtag }, async function (err, hashtagFound) {
    if (err) {
      console.log('error finding the requested hashtag')
    } else {
      if (!hashtagFound) {
        // Create new hashtag if it doesn't exist
        console.log(`creating new hashtag of ${hashtag}`)
        let newHashtag = new Hashtag();
        newHashtag.hashtagName = hashtag
        newHashtag.users = [user]
        newHashtag.save((err) => {
          if (err){
            console.log('error saving newHashtag')
          } else {
            console.log('successful saving newHashtag')
          }
        });
      } else {
        // found an existing hashtag
        console.log('found existing hashtag')
        console.log(hashtagFound.users)
        if(hashtagExists(hashtagFound.users, user)) {
          console.log('user already has the hashtag')
        } else {
          console.log('user doesnt have the hashtag')
          hashtagFound.users.push(user)
          hashtagFound.save((err) => {
            if (err){
              console.log('error pushing the new user to the hashtagFound')
            } else {
              console.log('successful pushing the new user to the hashtagFound')
            }
          });
        }
      }
    }
  });
}
function hashtagExists(array, substring){
  const match = array.find(element => {
    if (element.includes(substring)) {
      return true;
    }
  });
  return match
}
function findHashtags(searchInput) {
    result = searchInput.split(' ').filter(v=> v.startsWith('#'));
    for(var i=0; i < result.length; i++) {
     result[i] = result[i].replace('#', '');
    }
    if (result) {
        return result
    } else {
        return false;
    }
}

module.exports = router;
