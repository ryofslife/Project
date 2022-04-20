/* ---------- MODULES ---------- */
const express = require('express')
const authObj = require('../middleware/auth');

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const connection = require('../config/database.js');
const Conversation = connection.models.Conversation;
const Message = connection.models.Message;

/* ---------- ROUTES ---------- */
router.get('/:requestedUser', authObj.isAuthenticated, async (req, res) => {

    Conversation.findOne({$or: [
      {members:{$eq:[req.user.username,req.params.requestedUser]}},
      {members:{$eq:[req.params.requestedUser,req.user.username]}}
    ]}).populate('messages').exec(function (err, conversationFound) {
      if (err) {
        console.log('error occured')
        return res.status(500).json(err);
      } else {
        if (!conversationFound) {
          // Create new Conversation if it doesn't exist
          console.log(`creating new conversation for ${req.user.username} and ${req.params.requestedUser}`)
          let newConversation = new Conversation();
          newConversation.members = [req.user.username, req.params.requestedUser]
          newConversation.save((err, savedConversation) => {
            if (err){
              console.log('error saving new conversation')
              console.log(err)
              return res.status(500).json(err);
            } else {
              console.log('successful saving new conversation')
              return res.status(200).json(savedConversation);
            }
          });
        } else {
          // return the existing Conversation
          console.log(`found existing conversation between ${req.user.username} and ${req.params.requestedUser}`)
          return res.status(200).json(conversationFound)
        }
      }
    });
});

module.exports = router;
