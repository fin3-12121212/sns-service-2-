const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Board = require('../models/board'); // 게시판 모델 추가

// 메인 페이지 라우터
router.get('/', async (req, res) => {
    try {
        const boards = await Board.find().sort({ name: 1 }); // 게시판 목록 가져오기
        res.render('main', { user: req.user, boards });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
