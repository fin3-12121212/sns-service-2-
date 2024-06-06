const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Post = require('../models/post');

// 글 목록 조회
router.get('/', async (req, res) => {
    const posts = await Post.find().populate('user_id', 'username email');
    res.json(posts);
});

// 특정 글 조회
router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id).populate('user_id', 'username email');
    if (!post) return res.status(404).send('Post not found');
    res.json(post);
});

// 글 작성
router.post('/', verifyToken, async (req, res) => {
    const post = new Post({
        user_id: req.user._id,
        title: req.body.title,
        content: req.body.content
    });
    await post.save();
    res.status(201).json(post);
});

// 글 수정
router.put('/:id', verifyToken, async (req, res) => {
    const post = await Post.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        { title: req.body.title, content: req.body.content, updated_at: Date.now() },
        { new: true }
    );
    if (!post) return res.status(404).send('Post not found or not authorized');
    res.json(post);
});

module.exports = router;