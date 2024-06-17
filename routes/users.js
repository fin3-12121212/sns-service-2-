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
// 사용자 수를 반환하는 경로 추가
router.get('/count', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).send({ count: userCount });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// 나머지 사용자 관련 라우트 코드...

module.exports = router;
