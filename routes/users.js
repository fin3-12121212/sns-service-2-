<<<<<<< HEAD
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
=======
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
>>>>>>> 93078bd5386eb05ed90f7db5cead65d9f445413a
});

// 로그인
router.post('/login', async (req, res) => {
<<<<<<< HEAD
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid username or password' });

    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.send({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send({ message: 'Logout successful' });
=======
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
>>>>>>> 93078bd5386eb05ed90f7db5cead65d9f445413a
});

module.exports = router;
