const express = require('express');
const router = express.Router();
const Board = require('../models/board');

// 게시판 생성
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const board = new Board({ name, description });
        await board.save();
        res.status(201).send({ message: 'Board created successfully' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// 모든 게시판 조회
router.get('/', async (req, res) => {
    try {
        const boards = await Board.find().sort({ created_at: -1 });
        res.send(boards);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
