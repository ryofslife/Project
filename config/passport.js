const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('../config/database.js');
const User = connection.models.User;
const validPassword = require('../lib/passwordUtils.js').validPassword;

const customFields = {
  usernameField: 'uname',
  passwordField: 'pwd'
};

const verifyCallback = (username, password, done) => {
  
  User.findOne({ username: username })
      .then((user) => {

          if (!user) { return done(null, false) }

          const isValid = validPassword(password, user.hash, user.salt);

          if (isValid) {
              // console.log('the request is verified!')
              return done(null, user);
          } else {
              return done(null, false);
          }
      })
      .catch((err) => {
          done(err);
      });
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);


// user.id will be part of the session
passport.serializeUser((user, done) => {
    // console.log('serialized!')
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            // console.log('deserialized!')
            done(null, user);
        })
        .catch(err => done(err))
});
