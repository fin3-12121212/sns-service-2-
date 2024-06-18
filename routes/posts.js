const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Post = require('../models/post');
const Board = require('../models/board'); // 게시판 모델 추가

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
router.post('/', async (req, res) => {
    try {
        const { user_id, board, title, content } = req.body;

        // 게시판 존재 여부 확인
        const existingBoard = await Board.findOne({ name: board });
        if (!existingBoard) {
            return res.status(400).send({ message: 'Board does not exist' });
        }

        const post = new Post({ user_id, board, title, content });
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
        res.send(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 모든 게시글 조회
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id', 'username').sort({ created_at: -1 });
        res.send(posts);
    } catch (error) {
        res.status(400).send({ message: error.message });
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

// 회원 가입 폼
router.get('/register', (req, res) => {
  res.render('register');
});

// 로그인 폼
router.get('/login', (req, res) => {
  res.render('login');
});

// 사용자 프로필 편집 폼
router.get('/edit_profile.html', (req, res) => {
  res.render('edit_profile');
});

module.exports = router;
