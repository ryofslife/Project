/* ---------- MODULES ---------- */
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
var flash = require('express-flash');
var crypto = require('crypto');
var routes = require('./routes/index.js');
const connection = require('./config/database.js');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const socket = require("socket.io");

/* ---------- CLASSES & INSTANCES ---------- */
// Create the Express application
const app = express();

/* ---------- CONSTANTS ---------- */
require('dotenv').config();
var PORT = process.env.PORT || 3000;

/* ----- Express ----- */
app.set('trust proxy', true)
//for setting whatever filename to 'views' for the view engine
//app.set('views', path.join(__dirname, '/yourViewDirectory'));
app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public'))); // URL path begins at /public.

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());
// setting header for acceptable javascripts
app.use(function (req, res, next) {
  res.setHeader(
    // instagram needs to start with http
    "Content-Security-Policy", "script-src 'self' http://www.instagram.com https://code.jquery.com https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com https://unpkg.com/socket.io-client@4.4.1/dist/socket.io.min.js"
  );
  next();
});
// be sure to use express.session() before passport.session() to ensure that the login session is restored in the correct order
const sessionStore = new MongoStore({mongooseConnection: connection, collection: 'sessions'});
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

/* ---------- FUNCTIONS ---------- */
// enabling Passport strategies that were setted up in other files
require('./config/passport.js')

/* ----- Passport ----- */
// express.session() gives access to requests
// same as if (req.session.passport.user !== null), logged in, then derializeUser to populate req.user
app.use(passport.initialize());
app.use(passport.session());

// pops up for every single route request, same for the above two middlewares
// app.use((req, res, next) => {
//     // express.session object
//     console.log(req.session);
//     // passport middleware object
//     // once logged out, the req.user object will no longer exist
//     console.log(req.user);
//     next();
// });

/* ---------- ROUTES ---------- */
// router object is returned to the front page
app.use(routes);

// Redirect invalid pages
app.use((req, res) => {
    res.format({
        html: () => {
            res.status(404);
            // res.render('404.ejs');
            res.send('The requested page does not exist! <a href="/">Home Page</a>');
        },
        default: () => {
            res.type('txt').send('Not found');
        }
    });
});

/* ---------- LAUNCH ---------- */
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
// const server = app.listen(PORT, "0.0.0.0", () => {
//     console.log(`Server running at http://0.0.0.0:${PORT}`);
// });

/* ---------- Socket.io ---------- */
io = socket(server);

//database connection
const Conversation = connection.models.Conversation;
const Message = connection.models.Message;

//setup event listener
io.on('connection', io => {
  console.log('New user connected');

  io.on('join', (room, callback) => {
    io.join(room);
    console.log(`Someone joined the room ${room}`);

    callback();

    io.on("chat message", function(msg) {
      console.log("message: " + msg);

      // broadcast message to everyone in port:5000 except yourself.
      // console.log('from received')
      // ONLY NEED TO SEND THE MESSAGE CONTENT AS LISTEDUSER IS ALWAYS THE SENDER HERE WHICH IS KNOWN INSIDE THE MESSAGELIST.JS
      io.to(room).emit("received", { message: msg.message});

      //save chat to the database
      Conversation.findById(room, (err, conversation) => {
        if (err) {
          console.log(err)
        } else {
          let message = new Message;
          message.sender = msg.sender;
          message.message = msg.message;
          message.save((err, result) => {
            if (err){
              console.log(err)
            } else {
              conversation.messages.push(result)
              conversation.save();
            }
          })
        }
      })
    });
  });

  io.on('disconnect', () => {
    console.log('User was disconnected');
  });

});
