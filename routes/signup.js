/* ---------- MODULES ---------- */
const express = require('express');
const genPassword = require('../lib/passwordUtils').genPassword;

/* ---------- CLASSES & INSTANCES ---------- */
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
const connection = require('../config/database.js');
const User = connection.models.User;
const Hashtag = connection.models.Hashtag;

/* ---------- ROUTES ---------- */
router.get('/unameList', async (req, res, next) => {
    User.find({}).exec(function (err, userList) {
      if (err) {
        console.log('failed to fetch list of username')
        res.status(500).json(err);
      } else {
        console.log('successful fetching list of username')
        // return the list of users
        return res.status(200).json(userList)
      }
    });
});

router.post('/', async (req, res, next) => {

    const saltHash = genPassword(req.body.pwd);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    let userObj = {
        username: req.body.uname,
        hash: hash,
        salt: salt,
        // admin: true
    };

    const newUser = new User(userObj);

    newUser.save((err) => {
        // Check for invalid user input.
        if (err) {
            console.log('error saving the new user')
            return res.status(409).redirect('/');
        }

        Hashtag.findOne({ hashtagName: req.body.homeState }, function (err, homeStateHashtagFound) {
          if (err) {
            console.log('error finding the requested homeState hashtag')
            return res.status(409).redirect('/');
          } else {
            if (!homeStateHashtagFound) {
              // Create new hashtag if it doesn't exist
              console.log(`creating new hashtag of ${req.body.homeState}`)
              let newHomeStateHashtag = new Hashtag();
              newHomeStateHashtag.hashtagName = req.body.homeState
              newHomeStateHashtag.users = [req.body.uname]
              newHomeStateHashtag.save((err) => {
                if (err){
                  console.log('error saving newHomeStateHashtag')
                  return res.status(409).redirect('/');
                } else {
                  console.log('successful saving newHomeStateHashtag')
                  Hashtag.findOne({ hashtagName: req.body.style }, function (err, styleHashtagFound) {
                    if (err) {
                      console.log('error finding the requested style hashtag')
                      return res.status(409).redirect('/');
                    } else {
                      if (!styleHashtagFound) {
                        // Create new hashtag if it doesn't exist
                        console.log(`creating new hashtag of ${req.body.style}`)
                        let newStyleHashtag = new Hashtag();
                        newStyleHashtag.hashtagName = req.body.style
                        newStyleHashtag.users = [req.body.uname]
                        newStyleHashtag.save((err) => {
                          if (err){
                            console.log('error saving newStyleHashtag')
                            return res.status(409).redirect('/');
                          } else {
                            console.log('successful saving newStyleHashtag')
                            req.login(newUser, function (err) {
                                if (err) {
                                    return res.status(409).redirect('/');
                                }
                                return res.redirect('/login-success');
                            });
                          }
                        });
                      } else {
                        // found an existing hashtag
                        console.log('found existing style hashtag')
                        styleHashtagFound.users.push(req.body.uname)
                        styleHashtagFound.save((err) => {
                          if (err){
                            console.log('error pushing the new user to the styleHashtagFound')
                            return res.status(409).redirect('/');
                          } else {
                            console.log('successful pushing the new user to the styleHashtagFound')
                            req.login(newUser, function (err) {
                                if (err) {
                                    return res.status(409).redirect('/');
                                }
                                return res.redirect('/login-success');
                            });
                          }
                        });
                      }
                    }
                  });
                }
              });
            } else {
              // found an existing hashtag
              console.log('found existing homeState hashtag')
              homeStateHashtagFound.users.push(req.body.uname)
              homeStateHashtagFound.save((err) => {
                if (err){
                  console.log('error pushing the new user to the homeStateHashtagFound')
                  return res.status(409).redirect('/');
                } else {
                  console.log('successful pushing the new user to the homeStateHashtagFound')
                  Hashtag.findOne({ hashtagName: req.body.style }, function (err, styleHashtagFound) {
                    if (err) {
                      console.log('error finding the requested style hashtag')
                      return res.status(409).redirect('/');
                    } else {
                      if (!styleHashtagFound) {
                        // Create new hashtag if it doesn't exist
                        console.log(`creating new hashtag of ${req.body.style}`)
                        let newStyleHashtag = new Hashtag();
                        newStyleHashtag.hashtagName = req.body.style
                        newStyleHashtag.users = [req.body.uname]
                        newStyleHashtag.save((err) => {
                          if (err){
                            console.log('error saving newStyleHashtag')
                            return res.status(409).redirect('/');
                          } else {
                            console.log('successful saving newStyleHashtag')
                            req.login(newUser, function (err) {
                                if (err) {
                                    return res.status(409).redirect('/');
                                }
                                return res.redirect('/login-success');
                            });
                          }
                        });
                      } else {
                        // found an existing hashtag
                        console.log('found existing style hashtag')
                        styleHashtagFound.users.push(req.body.uname)
                        styleHashtagFound.save((err) => {
                          if (err){
                            console.log('error pushing the new user to the styleHashtagFound')
                            return res.status(409).redirect('/');
                          } else {
                            console.log('successful pushing the new user to the styleHashtagFound')
                            req.login(newUser, function (err) {
                                if (err) {
                                    return res.status(409).redirect('/');
                                }
                                return res.redirect('/login-success');
                            });
                          }
                        });
                      }
                    }
                  });
                }
              });
            }
          }
        });
    });
});

module.exports = router;
