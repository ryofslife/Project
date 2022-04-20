/* ---------- MODULES ---------- */
const axios = require('axios');
const moment = require('moment')

/* ---------- CLASSES & INSTANCES ---------- */
const connection = require('../config/database.js');
const Post = connection.models.Post;
const Comment = connection.models.Comment;
const Location = connection.models.Location;

/* ---------- FUNCTIONS ---------- */
let authObj = {};

/* ----- Authentication ----- */
//creating authentication object
authObj.isLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        const posts = await Post.find().populate('comments').sort({ createdAt: 'desc' })
        const postsNum = await Post.find().countDocuments();

        // get visitor's location
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        // const ip = "76.10.46.67"
        const localIps = ['::1', '127.0.0.1', 'localhost']
        // console.log(ip)

        if (localIps.includes(ip)) {
          console.log('requesting from localIps')
        } else {
          let location = new Location;
          const requestedLocation = await axios.get(`http://ip-api.com/json/${ip}`)
          const { data } = requestedLocation
          // console.log(data.country)
          // console.log(data.regionName)
          // console.log(data.city)
          location.visitedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
          location.country = data.country;
          location.state = data.regionName;
          location.city = data.city;
          await location.save()
        }

        res.render('landing.ejs', { posts: posts, postsNum: postsNum, csrfToken: req.csrfToken() })
    }
};

authObj.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(404);
        res.render('404', {flash: req.flash('error')});
    }
};

module.exports = authObj;
