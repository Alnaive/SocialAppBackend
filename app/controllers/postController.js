const db = require('../models');
const config = require("../config/auth.js");
const { authJwt } = require("../middleware");

const Post = db.post;
var jwt = require("jsonwebtoken");

exports.createPost = async (req, res) => {
    try {
      const { title, description, chainedPost } = req.body;
      if (!description) {
        return res.status(400).json({ message: 'description cannot be empty' });
      }
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
  
      // Create new chainedPost object with owner ID if default is true
      const chainedPostWithOwner = chainedPost.default ? {
        owner: decoded.id,
        description: chainedPost.description,
        default: true
      } : chainedPost;
  
      const post = await Post.create({ title, description, owner: decoded.id, chainedPost: chainedPostWithOwner });
      res.json(post);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while inserting' });
    }
  };
  
  exports.createComment = async (req, res) => {
    try {
      const postId = req.params.postId;
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ message: 'Comment text cannot be empty' });
      }
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
      const user = await User.findById(decoded.id);
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const comment = {
        user: decoded.id,
        text,
        date: new Date(),
        deleted: false,
        commentLikes: [],
        reply: []
      };
      post.comments.push(comment);
      await post.save();
      res.json(comment);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while inserting comment' });
    }
  };
  
  exports.likeComment = async (req, res) => {
    try {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
      const user = await User.findById(decoded.id);
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (comment.commentLikes.some(like => like.user.toString() === decoded.id)) {
        return res.status(400).json({ message: 'You have already liked this comment' });
      }
      comment.commentLikes.push({ user: decoded.id });
      await post.save();
      res.json({ message: 'Comment liked successfully' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while liking comment' });
    }
  };
  

  exports.deleteComment = async (req, res) => {
    try {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
      const user = await User.findById(decoded.id);
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      if (comment.user.toString() !== decoded.id) {
        return res.status(401).json({ message: 'You are not authorized to delete this comment' });
      }
      comment.deleted = true;
      await post.save();
      res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while deleting comment' });
    }
  };
  
  exports.replyToComment = async (req, res) => {
    try {
      const { commentId, text } = req.body;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
  
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      const reply = {
        user: decoded.id,
        text,
      };
  
      comment.reply.push(reply);
      await comment.save();
  
      res.json(comment);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while replying to comment' });
    }
  };

  exports.deleteReply = async (req, res) => {
    try {
      const { commentId, replyId } = req.body;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
  
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      const reply = comment.reply.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
  
      if (reply.user.toString() !== decoded.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this reply' });
      }
  
      reply.deleted = true;
      await comment.save();
  
      res.json(comment);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while deleting reply' });
    }
  };
  

  exports.update = async (req, res) => {
    try {
      const { postId, title, caption } = req.body;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
  
      const post = await Post.findOne({ id: postId, owner: decoded.id });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      post.title = title || post.title;
      post.caption = caption || post.caption;
      await post.save();
  
      res.json(post);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while updating post' });
    }
  };
  

  exports.softDelete = async (req, res) => {
    try {
      const { postId } = req.params;
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
  
      const post = await Post.findOne({ _id: postId, owner: decoded.id });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      post.is_deleted = true;
      post.deleted_at = new Date();
      await post.save();
  
      res.json({ message: 'Post soft deleted' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Error while soft deleting post' });
    }
  };