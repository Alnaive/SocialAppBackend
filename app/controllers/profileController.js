require('dotenv').config();
const config = require("../config/auth.js");
const db = require("../models");
const { authJwt } = require("../middleware");
const isEmpty = require('lodash.isempty');

const Profile = db.profile;
const About = db.about;
var jwt = require("jsonwebtoken");

exports.showProfile = (req, res) => {
    const ownerId = req.params.ownerId;

    Profile.find({ owner: ownerId })
    .then((data) => {
        if (!data) {
            res.status(404).json({
                message: `Profile not found for owner with id ${ownerId}`
            })
        } else {
            res.status(200).json(data)
        }
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail retrieving profile data for owner id'
        })
    });
}

exports.showAbout = async (req, res) => { 
    try {
      const ownerId = req.params.ownerId;
      const about = await About.findOne({ owner: ownerId });
      if (!about) {
        return res.status(404).json({
          message: `About Profile not found for owner with id ${ownerId}`,
        });
      }
      res.status(200).json(about);
    } catch (err) {
      res.status(500).json({
        message: err.message || 'Fail retrieving about profile data for owner id',
      });
    }
  };
  

  exports.updateProfile = async (req, res) => {
    try {
      const ownerId = req.params.ownerId;
      const profile = await Profile.findOne({ owner: ownerId });
      if (!profile) {
        return res.status(404).json({
          message: `Profile not found for owner with id ${ownerId}`,
        });
      }
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
      if (isEmpty(req.body)) {
        return res.status(404).json({ message: 'Empty body' });
      }
      Object.assign(profile, req.body);
      await profile.save();
      res.send(profile);
    } catch (err) {
      res.status(500).json({
        message: err.message || 'Fail retrieving profile data for owner id',
      });
    }
  };
  
  exports.storeAbout = async (req, res) => {
    try {
      const ownerId = req.params.ownerId;
      const newAbout = await About.findOne({ owner: ownerId });
      if (!newAbout) {
        return res.status(404).json({
          message: `About not found for owner with id ${ownerId}`,
        });
      }
  
      const {title, description} = req.body;
      const aboutDocs = {
          title,
          description
      };
      await newAbout.about.push(aboutDocs);
      await newAbout.save()
  
      res.status(200).json({ message: 'About updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  exports.updateAbout = async (req, res) => {
    try {
      const ownerId = req.params.ownerId;
      const about = await About.findOne({ owner: ownerId });
      if (!about) {
        return res.status(404).json({
          message: `about not found for owner with id ${ownerId}`,
        });
      }
      const token = req.headers['x-access-token'];
      const decoded = jwt.verify(token, config.secret);
      if (isEmpty(req.body)) {
        return res.status(404).json({ message: 'Empty body' });
      }
      Object.assign(about, req.body);
      await about.save();
      res.send(about);
    } catch (err) {
      res.status(500).json({
        message: err.message || 'Fail retrieving about data for owner id',
      });
    }
  };