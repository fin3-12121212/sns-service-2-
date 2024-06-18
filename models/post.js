const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    board: { type: String, required: true }, // 게시판 정보 추가
    title: { type: String, required: true },
    content: { type: String, required: true },
    hashtags: [String], // 해시태그 추가
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

postSchema.index({ title: 'text', content: 'text', hashtags: 'text' }); // 텍스트 인덱스 추가

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
