var express = require('express');
var router = express.Router();

require('../models/connection')
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

const uid2 = require('uid2');

const bcrypt = require('bcrypt')

router.post('/signin', (req,res) => {
    if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
    }
    User.findOne({username: req.body.username})
    .then(data => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
              res.json({ result: true, token: data.token, firstname: data.firstname, username: data.username });
            } else {
              res.json({ result: false, error: 'User not found or wrong password' });
            }
    })
}); //fermeture de la router

router.post('/signin', (req,res) => {
    if (!checkBody(req.body, ['firstname', 'username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
    }

    User.findOne({firstname: req.body.firstname, username: req.body.username})
    .then(data => {
        if (data && bcrypt.compareSync(req.body.password, data.password)) {
              res.json({ result: true, token: data.token });
            } else {
              res.json({ result: false, error: 'User not found or wrong password' });
            }
    })

}); //fermeture de la router

module.exports = router;

router.post('/tweets/:token', (req, res) => {
  User.findOne({ token: req.params.token }).then(data => {
    if (data) {
      res.json({ result: true, tweet: data.tweet });
    } else {
      res.json({ result: false, error: 'User not found' });
    }
  });
});