var express = require('express');
var router = express.Router();
const Tweet = require('../models/tweets');
const User = require('../models/users');

// Récupère tous les tweets, triés du plus récent au plus ancien
router.get('/', (req, res) => {
    Tweet.find().populate('user').sort({ date: -1})
    .then((tweets) => res.json ({ result: true, tweets }));
});

// Crée un nouveau tweet
router.post('/', (req, res) => {
  const { content, token } = req.body;

  User.findOne({ token }).then((user) => {
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    const hashtags = content.match(/#\w+/g)?.map((h) => h.slice(1)) || [];

    const newTweet = new Tweet({
      content,
      user: user._id,
      hashtags,
      likes: [],
    });

    newTweet.save().then((tweet) => {
      Tweet.findById(tweet._id).populate('user').then((populated) => {
        res.json({ result: true, tweet: populated });
      });
    });
  });
});

// Supprime un tweet à partir de son id
router.delete('/:id', (req, res) => {
    Tweet.findByIdAndDelete(req.params.id).then(() => {
        res.json({ result: true });
    });
});

// Like ou unlike un tweet selon si l'utilisateur l'a déjà liké ou non
router.put('/:id/like', (req, res) => {
  const { userId } = req.body;

  Tweet.findById(req.params.id).then((tweet) => {
    if (!tweet) {
      res.json({ result: false, error: 'Tweet not found' });
      return;
    }

    const alreadyLiked = tweet.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    Tweet.findByIdAndUpdate(req.params.id, update, { new: true }).then((updated) => {
      res.json({ result: true, tweet: updated });
    });
  });
});

// Récupère tous les hashtags utilisés, avec leur nombre d'occurrences
router.get('/trends', (req, res) => {
    Tweet.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).then((trends) => {
      res.json({ result: true, trends });
    });
});

// Récupère tous les tweets contenant un hashtag précis
router.get('/hashtag/:name', (req, res) => {
    Tweet.find({ hashtags: req.params.name }).populate('user')
    .then((tweets) => res.json({ result: true, tweets }));
});

module.exports = router;