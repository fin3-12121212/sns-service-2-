const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  board: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  hashtags: [String], // 해시태그 
  image: { type: String }, // 이미지 경로 필드 추가
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

postSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
