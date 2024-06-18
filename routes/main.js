const express = require('express');
const router = express.Router();
const User = require('../models/user'); // 사용자 모델 가져오기

// 사용자 수를 반환하는 경로 추가
router.get('/count', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).send({ count: userCount });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
