const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// 메인 페이지 라우터
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id', 'username email').sort({ created_at: -1 });
        res.render('main', { posts, user: req.user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
