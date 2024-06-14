<<<<<<< HEAD
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/users.html');
=======
const express = require('express');
const router = express.Router();
const Post = require('../models/post');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const posts = await Post.find().populate('user_id', 'username email').sort({ created_at: -1 });
    res.render('index', { posts, user: req.user });
  } catch (error) {
    next(error);
  }
>>>>>>> 93078bd5386eb05ed90f7db5cead65d9f445413a
});

module.exports = router;
