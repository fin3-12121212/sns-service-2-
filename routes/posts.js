const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Post = require('../models/post');

// 글 목록 조회
router.get('/', async (req, res) => {
    const posts = await Post.find().populate('user_id', 'username email').sort({ created_at: -1 });
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
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send('Title and content are required');
        }

        const post = new Post({
            user_id: req.user._id,
            title: req.body.title,
            content: req.body.content
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).send('Error saving the post');
    }
});

// 글 수정
router.put('/:id', verifyToken, async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }

    const post = await Post.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        { title, content, updated_at: Date.now() },
        { new: true }
    );
    if (!post) return res.status(404).send('Post not found or not authorized');
    res.json(post);
});

// 게시글 검색
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const posts = await Post.find({ $text: { $search: query } });
        res.json(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
