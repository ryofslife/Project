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

/* ---------- ROUTES ---------- */
// Creating a comment
router.post('/', authObj.isAuthenticated, async (req, res, next) => {
    req.comment = new Comment();
    next()
}, saveCommentAndRedirect('new'));

// Editing a comment
router.put('/edit/:id', authObj.isAuthenticated, async (req, res, next) => {
  // :id and req.params.id is the  _id (ObjectId) assigned to each Post
  // params. An object containing parameter values parsed from the URL path. For example if you have the route /user/:name , then the "name" from the URL path wil be available as req.params.name .
  req.comment = await Comment.findById(req.params.id);

  next();
}, saveCommentAndRedirect('edit'));

// Deleting a post
router.delete('/delete/:id', authObj.isAuthenticated, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id)
  res.redirect('/protected-route')
});

function saveCommentAndRedirect(path) {
  return async (req, res) => {
    let comment = req.comment
    if (path == 'new') {
      // postTitle only needs to be saved for the newly created comments and not for editing
      comment.postTitle = req.body.postTitle
    }
    comment.author = req.user._id,
    comment.authorName = req.user.username,
    comment.content = req.body.content
    try {
      comment = await comment.save((err, result) => {
        if (err){
          console.log(err)
        } else {
          if (path == 'new') {
            // need to save the newly created comment inside Post and it requires its id
            // Comments Functionality 12:49
            Post.findById(req.body.parentPost, (err, post) => {
              if (err) {
                console.log(err)
              } else {
                post.comments.push(result)
                post.save();
                return res.redirect(`/${req.body.originRoute}`)
              }
            })
          } else {
            return res.redirect(`/${req.body.originRoute}`)
          }
        }
      })
    } catch (e) {
      return res.redirect(`/${req.body.originRoute}`)
    }
  }
};

module.exports = router;
