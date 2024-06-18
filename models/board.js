const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
