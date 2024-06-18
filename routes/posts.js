const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Post = require('../models/post');
const Board = require('../models/board');

// 글 목록 조회
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id', 'username email').sort({ created_at: -1 });
        res.json(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 특정 글 조회
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user_id', 'username email');
        if (!post) return res.status(404).send('Post not found');
        res.json(post);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 글 작성
router.post('/', verifyToken, async (req, res) => {
    try {
        const { board, title, content, hashtags } = req.body;
        const user_id = req.user._id;

        // 게시판 존재 여부 확인
        const existingBoard = await Board.findOne({ name: board });
        if (!existingBoard) {
            return res.status(400).send({ message: 'Board does not exist' });
        }

        const post = new Post({ user_id, board, title, content, hashtags });
        await post.save();
        res.status(201).send({ message: 'Post created successfully' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 특정 게시판의 글 목록 조회
router.get('/board/:boardName', async (req, res) => {
    try {
        const { boardName } = req.params;
        const posts = await Post.find({ board: boardName }).populate('user_id', 'username').sort({ created_at: -1 });
        res.json(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 게시글 검색
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const posts = await Post.find({ $text: { $search: query } }).populate('user_id', 'username');
        res.json(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 해시태그 검색
router.get('/search/hashtag', async (req, res) => {
    try {
        const hashtag = req.query.hashtag;
        const posts = await Post.find({ hashtags: hashtag }).populate('user_id', 'username');
        res.json(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
