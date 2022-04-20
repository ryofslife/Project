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

const router = express.Router();

router.get('/', authObj.isAuthenticated, async (req, res, next) => {
    await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    }, (err, conversation) => {
      if (err) {
        res.status(500).json(err);
      } else {
        if (!result) {
          // Create new Conversation if it doesn't exist
          conversation = new Conversation();
          return res.status(200).json(conversation)
        } else {
          // return the existing Conversation
          return res.status(200).json(conversation)
        }
      }
    });
});

module.exports = router;
