const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // 사용자 모델 가져오기
const Post = require('../models/post'); // 포스트 모델 가져오기

// 회원가입, 로그인, 로그아웃, 사용자 수 등 기존 코드 생략...

// 특정 사용자의 글 목록을 반환하는 경로 추가
router.get('/posts', async (req, res) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret');
    const posts = await Post.find({ user_id: decoded._id }).sort({ createdAt: -1 });
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// 특정 글을 조회하는 경로 추가
router.get('/post=:postid', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid).populate('user_id', 'username email');
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
