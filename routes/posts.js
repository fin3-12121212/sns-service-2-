const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Board = require('../models/board');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // 업로드 폴더 설정
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // 파일 이름 설정
    }
});

const upload = multer({ storage: storage });

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
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { board, title, content } = req.body;
        const user_id = req.user._id;
        const image = req.file ? req.file.path : null;

        console.log('Received request to create post:', { board, title, content, user_id, image });

        // 게시판 존재 여부 확인
        const existingBoard = await Board.findOne({ name: board });
        if (!existingBoard) {
            console.error('Board does not exist:', board);
            return res.status(400).send({ message: 'Board does not exist' });
        }

        const post = new Post({ user_id, board, title, content, image });
        await post.save();
        console.log('Post created successfully:', post);
        res.status(201).send({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send({ message: 'Internal server error', error: error.message });
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
        console.log('Received search query:', query); // 로그에 검색어 기록

        if (!query) {
            console.log('Query is missing');
            return res.status(400).send({ message: 'Query is required' });
        }

        const posts = await Post.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).populate('user_id', 'username');

        console.log('Found posts:', posts); // 로그에 검색 결과 기록
        res.json(posts);
    } catch (error) {
        console.error('Error searching posts:', error); // 로그에 오류 기록
        res.status(400).send({ message: error.message });
    }
});

// 해시태그 검색
router.get('/search/hashtag', async (req, res) => {
    try {
        const hashtag = req.query.hashtag;
        const posts = await Post.find({ hashtags: hashtag });
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
