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
    // for displaying posts with the hiddenHashtag of @Youtube
    const posts = await Post.find({ hiddenHashtags: { $in: ['#@Youtube'] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find({ hiddenHashtags: { $in: ['#@Youtube'] } }).countDocuments();

    res.render('youtubePosts.ejs', { name: req.user.username, post: new Post(), posts: posts, postsNum: postsNum, csrfToken: req.csrfToken(), message: req.flash('message') })
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
}, savePostAndRedirect('/youtubePosts'));

// Deleting a post
router.delete('/delete/:id', authObj.isAuthenticated, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id)
  res.redirect('/protected-route')
});

function savePostAndRedirect(path) {
  return async (req, res) => {
    let post = req.post
    post.author = req.user._id,
    post.authorName = req.user.username,
    post.title = req.body.title,
    post.content = req.body.content
    post.htmlCode = req.body.htmlCode
    // need to store only the necessary strings from the input html code
    var re = /(\w+)=(.+?)(?= \w+=|$)/gm;
    var str = req.body.htmlCode;
    var m;
    while ((m = re.exec(str)) !== null) {
        if (m.index === re.lastIndex){
            re.lastIndex++;
        }
        if (m[1] == 'src') {
            // string.replace(/\"/g,""); for removing ""
            console.log('the source of the post is ' + m[2].replace(/\"/g,""))
            post.source = m[2].replace(/\"/g,"")
        }
        if (m[1] == 'width') {
            console.log('the width of the post is ' + m[2].replace(/\"/g,""))
            post.width = m[2].replace(/\"/g,"")
        }
        if (m[1] == 'height') {
            console.log('the height of the post is ' + m[2].replace(/\"/g,""))
            post.height = m[2].replace(/\"/g,"")
        }
    }
    // instead of saving heiddenHashtag with regular hashtags, create new place inside 'Post' document, this only need to be saved inside posts and req.body.hiddenHashtag does not need to be save for a user using saveHashtag, in addition req.body.hiddenHashtag can not be empty so there is no need for checking it with if statement
    if(req.body.hashtags) {
      post.hashtags = findHashtags(req.body.hashtags)
    }
    post.hiddenHashtags = req.body.hiddenHashtag
    try {
      if (post.source.substring(0,23) == "https://www.youtube.com") {
        req.flash('message', 'The post was submitted successfully.');
        post = await post.save()
        return res.redirect(`${path}`)
      } else {
        req.flash('message', 'The submitted source link is invalid.');
        return res.redirect(`${path}`)
      }
    } catch (e) {
      return res.render(`${path}`)
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
