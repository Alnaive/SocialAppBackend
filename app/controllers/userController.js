require('dotenv').config();
const config = require("../config/auth.js");
const db = require('../models');
const User = db.user;
const Profile = db.profile;
const nodemailer = require('nodemailer');
const isEmpty = require('lodash.isempty');

var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

exports.sendEmailVerification = async(req, res) => {
    const { email } = req.body
    // Check we have an email
    if (!email) {
       return res.status(422).send({ message: "Missing email." });
    }
    try{
       // Check if user is login
       let token = req.headers["x-access-token"];
        if (!token) {
            return res.status(404).send({ message: "error token Not found" });
        }

        const user = await User.findOne({ email }).exec();
        if (!user) {
             return res.status(404).send({ 
                   message: "User does not exists" 
             });
        }

        if(!user.verified){
            const verificationToken = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
                });
                const tokenWithUnderscores = verificationToken.replace(/\./g, "_");
                const encodedToken = encodeURIComponent(tokenWithUnderscores);
                const url = `http://localhost:5173/emailVerify/${encodedToken}`;
               transporter.sendMail({
                 to: email,
                 subject: 'Verify Account',
                 html: `Click <a href = '${url}'>here</a> to confirm your email.`
               })
               return res.status(201).json({
                 message: `Sent a verification email to ${email}`
               });
        } else {
            return res.status(201).json({
                message: `Account has been verified`
            });
        }
   } catch(err){
       return res.status(500).json(err);
   }
  }

  exports.verifyEmail = async (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(422).json({ 
             message: "Missing Token" 
        });
    }
    let payload = null
    try {
        payload = jwt.verify(
           token,
           config.secret
        );
    } catch (err) {
        return res.status(500).send(err);
    }
    try{
        // Find user with matching ID
        const user = await User.findOne({ id: payload.ID }).exec();
        if (!user) {
           return res.status(404).send({ 
              message: "User does not  exists" 
           });
        }
        // Step 3 - Update user verification status to true
        user.verified = true;
        await user.save();
        return res.status(200).send({
              message: "Account Verified"
        });
     } catch (err) {
        return res.status(500).send(err);
     }
}

exports.index = (req, res) => {
    User.find({}, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(data);
        }
    });
}

exports.authUser = (req, res) => {
    let token = req.headers["x-access-token"];
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorized!" });
        }
       const id = req.userId = decoded.id;
       User.findById(id).select('username email name image verified')
       .then((data) => {
           if(!data){
               res.status(404).json({
                   message: `${id} not found`
               })
           } else {
               res.status(200).json(data)
           }
       }).catch((err) => {
           res.status(500).json({
               message: err.message || 'fail retrieving data id'
           })
       });
    });
}

exports.findUser = (req, res) => {
    const username = req.query.username;
    const condition = username ? {
        username: {
            $regex: new RegExp(username), $options: 'i'
        }
    } : {}

    User.find(condition)
    .then((data) => {
        res.status(200).json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail retrieving data'
        })
    });
}
exports.showUser = (req, res) => {
    const username = req.params.username;

    User.findOne({ username: username }).select('username email name image')
    .then((data) => {
        if (!data) {
            res.status(404).json({
                message: `${username} not found`
            })
        } else {
            res.status(200).json(data)
        }
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail retrieving data username'
        })
    });
}
exports.updateUser = async (req, res) => {
    try {
        if(isEmpty(req.body)) {
            res.status(404).json({message: 'empty body'});
        } else {
        const profile = await User.findById(req.params.id);
        Object.assign(profile, req.body);
        profile.save(); 
        res.send(profile);
        }
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}


exports.updatePassword = (req, res) => {
    if(!req.body){
        res.status(400).json({
            message: 'Invalid cannot be empty password',
        })
    }
    const id = req.params.id;
    const newPassword = req.body.newPassword
    const passwordConfirmation = req.body.passwordConfirmation

    if (newPassword !== passwordConfirmation) {
        res.status(400).send({ message: 'password do not match' })
    } else {
        User.findByIdAndUpdate(id, {password: newPassword})
            .then((data) => {
                if(!data){
                    res.status(404).json({
                        message: `${id} not found`
                    })
                } else {
                    res.status(200).json({
                        message: 'Password updated'
                    })
                }
            }).catch((err) => {
                res.status(500).json({
                    message: err.message || 'fail'
                })
            });
        }
}

exports.delete = (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id)
    .then((data) => {
        if(!data){
            res.status(404).json({
                message: `${id} not found`
            })
        } else {
            res.status(200).json({
                message:'data was deleted'
            })
        }
    }).catch((err) => {
        res.status(500).json({
            message: err.message || 'fail deleting data id'
        })
    });
}


exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
    
  };
  
  exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
  };
  
  exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
  };
  
  exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
  };