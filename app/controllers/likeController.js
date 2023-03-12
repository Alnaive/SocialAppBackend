const db = require('../models');
const config = require("../config/auth.js");
const { authJwt } = require("../middleware");

const Like = db.like;
var jwt = require("jsonwebtoken");

exports.like = async (req, res) => {
    try {
      const { post } = req.body;
      const token = req.headers['x-access-token'];
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
  
      try {
        const decoded = jwt.verify(token, config.secret);
        const userId = decoded.id;
  
        const like = await Like.findOne({ post, userId });
        if (like) {
          return res.status(400).json({ message: 'You already liked this post' });
        }
  
        const newLike = await Like.create({ post, userId });
        res.json(newLike);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while liking the post' });
    }
  };

exports.unlike = async (req, res) => {
    try {
        const { post } = req.body;
        const token = req.headers['x-access-token'];
        if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, config.secret);
        const userId = decoded.id;

        const like = await Like.findOneAndDelete({ post, userId });
        if (!like) {
        return res.status(400).json({ message: 'You have not liked this post' });
        }

        res.json(like);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Error while unliking the post' });
    }
};
  

