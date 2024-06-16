const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // 사용자 모델 가져오기

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    // 사용자 ID 중복 확인
    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).send({ message: 'ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, username, password: hashedPassword, email, customFields: {} });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body; // 로그인 시 사용자 ID로 로그인
    const user = await User.findOne({ name });
    if (!user) return res.status(400).send({ message: 'Invalid ID or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid ID or password' });

    const token = jwt.sign({ _id: user._id, name: user.name, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
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

// 사용자 정보 업데이트
router.post('/update', async (req, res) => {
  try {
    const { customFields } = req.body;
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret');
    await User.findByIdAndUpdate(decoded._id, { customFields });
    res.status(200).send({ message: 'Profile updated successfully' });
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

module.exports = router;
