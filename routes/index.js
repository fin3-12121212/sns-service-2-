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
});

module.exports = router;
