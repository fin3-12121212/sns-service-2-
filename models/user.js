const express = require('express');
const router = express.Router();
const User = require('../models/user'); // User 모델을 가져옵니다

<<<<<<< HEAD
// 사용자 수를 반환하는 경로 추가
router.get('/count', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).send({ count: userCount });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
=======
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // 사용자 ID 역할
    username: { type: String, required: true }, // 사용자 닉네임
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    customFields: {
      type: Map,
      of: {
        gameId: String,
        url: String
      },
      default: {}
    }
  });
>>>>>>> 25db367fa01b6920ac6a7adf7a280e79d02c5470

// 나머지 사용자 관련 라우트 코드...

module.exports = router;
