const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const user = new User({ username, password, name, email });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
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
});

// 회원가입 폼
router.get('/register', (req, res) => {
  res.render('register');
});

// 로그인 폼
router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
