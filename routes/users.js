const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// 회원 가입
router.post('/register', async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    await user.save();
    res.status(201).json(user);
});

// 로그인
router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('Invalid username or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid username or password');

    const token = jwt.sign({ _id: user._id, username: user.username }, 'your_jwt_secret');
    res.cookie('token', token, { httpOnly: true });
    res.json({ token });
});

// 회원 가입 폼
router.get('/register', (req, res) => {
    res.render('register');
});

// 로그인 폼
router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;
