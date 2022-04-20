/* ---------- MODULES ---------- */
const express = require('express')
const authObj = require('../middleware/auth');

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const connection = require('../config/database.js');
const Post = connection.models.Post;
const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
// Serve the hashtags.ejs
router.get('/', authObj.isLoggedIn, async (req, res, next) => {
    // for fetching user's hashtags
    const usersHashtags = await Hashtag.find({ users: { $in: [req.user.username] } }, {'_id' : 0, 'hashtagName' : 1});
    // for displaying posts with user's hashtag tagged
    const posts = await Post.find({ hashtags: { $in: hashtagList(usersHashtags) } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find({ hashtags: { $in: hashtagList(usersHashtags) } }).countDocuments();
    const allHashtags = await Hashtag.find();

    res.render('hashtags.ejs', { name: req.user.username, posts: posts, postsNum: postsNum, allHashtags: allHashtags, usersHashtags: usersHashtags, csrfToken: req.csrfToken() })
});

// Creating new hashtags
router.post('/', authObj.isAuthenticated, async (req, res) => {
    if (req.body.addHashtag) {
      var hashtagArray = await findHashtags(req.body.addHashtag)
      Hashtag.findOne({ hashtagName: hashtagArray[0] }, async function (err, hashtagFound) {
        if (err) {
          console.log('error finding the requested hashtag')
          return res.status(409).redirect('/');
        } else {
          if (!hashtagFound) {
            // Create new hashtag if it doesn't exist
            console.log(`creating new hashtag of ${hashtagArray[0]}`)
            let newHashtag = new Hashtag();
            newHashtag.hashtagName = hashtagArray[0]
            newHashtag.users = [req.user.username]
            newHashtag.save((err) => {
              if (err){
                console.log('error saving newHashtag')
                return res.status(409).redirect('/protected-route');
              } else {
                console.log('successful saving newHashtag')
                return res.redirect('/protected-route')
              }
            });
          } else {
            // found an existing hashtag
            console.log('found existing hashtag')
            console.log(hashtagFound.users)
            if(hashtagExists(hashtagFound.users, req.user.username)) {
              console.log('user already has the hashtag')
              return res.redirect('/protected-route')
            } else {
              console.log('user doesnt have the hashtag')
              hashtagFound.users.push(req.user.username)
              hashtagFound.save((err) => {
                if (err){
                  console.log('error pushing the new user to the hashtagFound')
                  return res.status(409).redirect('/protected-route');
                } else {
                  console.log('successful pushing the new user to the hashtagFound')
                  return res.redirect('/protected-route')
                }
              });
            }
          }
        }
      });
    }
});

// Showing the users sharing a hashtag
router.get('/users/:hashtag', authObj.isAuthenticated, async (req, res) => {
  // serching for the requested hashtag, hashtagRequested[0].NAME for accessing content
  const hashtagRequested = await Hashtag.find({ hashtagName: req.params.hashtag });

  res.render('usersHashtags.ejs', { name: req.user.username, hashtagRequested: hashtagRequested })
});

// Showing hashtags of the requested user
router.get('/view/:user', authObj.isAuthenticated, async (req, res) => {
  // for listing hashTags
  const hashtags = await Hashtag.find({ users: { $in: [req.params.user] } });

  res.render('viewHashtags.ejs', { name: req.user.username, main: req.user.username, listed: req.params.user, hashtags: hashtags })
});

// Showing posts with the requested hashtag
router.get('/selected', authObj.isAuthenticated, async (req, res) => {
  if (req.query.selectedHashtag == "All") {
      res.redirect('/hashtags');
  } else {
    // for fetching user's hashtags
    const usersHashtags = await Hashtag.find({ users: { $in: [req.user.username] } }, {'_id' : 0, 'hashtagName' : 1});
    // for displaying posts with the selected hashtag
    console.log(req.query.selectedHashtag)
    const posts = await Post.find({ hashtags: { $in: [req.query.selectedHashtag] } }).populate('comments').sort({ createdAt: 'desc' });
    const postsNum = await Post.find({ hashtags: { $in: [req.query.selectedHashtag] } }).countDocuments();
    const allHashtags = await Hashtag.find();

    res.render('hashtags.ejs', { name: req.user.username, posts: posts, postsNum: postsNum, allHashtags: allHashtags, usersHashtags: usersHashtags, csrfToken: req.csrfToken() })
  }
});

function hashtagList(hashtags){
   var hashtagList = [];
   for(var i=0; i<hashtags.length; i++){
      hashtagList.push(hashtags[i].hashtagName);
   }
   return hashtagList;
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
