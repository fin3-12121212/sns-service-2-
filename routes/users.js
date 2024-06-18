const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // 사용자 모델 가져오기

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, email } = req.body;
    console.log('Registering user:', { name, username, email }); // 입력된 사용자 정보 로그

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email); // 이메일 중복 로그
      return res.status(400).send({ message: 'Email already exists' });
    }

    // 사용자 ID 중복 확인
    const existingName = await User.findOne({ name });
    if (existingName) {
      console.log('ID already exists:', name); // ID 중복 로그
      return res.status(400).send({ message: 'ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시화
    console.log('Hashed Password:', hashedPassword); // 해시화된 비밀번호 로그
    const user = new User({ name, username, password: hashedPassword, email, customFields: {} });
    await user.save();
    console.log('User registered successfully:', user); // 등록된 사용자 로그
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error); // 오류 로그
    res.status(400).send({ message: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Logging in user:', username); // 입력된 사용자명 로그
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Invalid username:', username); // 유효하지 않은 사용자명 로그
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    console.log('Stored hashed password:', user.password); // 저장된 해시화된 비밀번호 로그
    console.log('Entered password:', password); // 입력된 비밀번호 로그
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // 비밀번호 일치 여부 로그
    if (!isMatch) {
      console.log('Invalid password for user:', username); // 유효하지 않은 비밀번호 로그
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ _id: user._id, username: user.username, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    console.log('Login successful, token:', token); // 성공적인 로그인과 토큰 로그
    res.send({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error); // 오류 로그
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded._id, { customFields });
    console.log('Profile updated for user:', decoded.username); // 프로필 업데이트 로그
    res.status(200).send({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error); // 오류 로그
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
