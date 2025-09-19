const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', attemptSchema);
