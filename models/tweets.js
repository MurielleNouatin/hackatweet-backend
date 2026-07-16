const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  content: { type: String, required: true, maxlength: 280 },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
