const db = require('../models');
const config = require("../config/auth.js");
const { authJwt } = require("../middleware");

const Follower = db.follower;
const Followed = db.followed;
var jwt = require("jsonwebtoken");

exports.followUser = async (req, res) => {
    try {
      const { username } = req.params;
      const token = req.headers['x-access-token'];
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }
  
      jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token.' });
        }
  
        const { id: userId } = decoded;
        const follow = await Follower.updateOne({ user: username, userId }, { $set: { user: username, userId } }, { upsert: true });
        if (follow.upserted) {
          return res.json(follow.upserted[0]);
        } else {
          return res.status(400).json({ message: 'You already follow this user' });
        }
      });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while follow the user' });
    }
  };
  

