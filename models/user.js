const express = require('express');
const router = express.Router();
const User = require('../models/user'); // User 모델을 가져옵니다

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
