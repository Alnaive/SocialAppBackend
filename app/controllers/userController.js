require('dotenv').config();
const config = require("../config/auth.js");
const collection = require('../models');
const User = collection.user;
const nodemailer = require('nodemailer');

var jwt = require("jsonwebtoken");


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
       let token = req.session.token;

        if (!token) {
            return res.status(404).send({ message: "error Not found" });
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
               // Step 3 - Email the user a unique verification link
               const url = `http://localhost:8000/api/user/verify/${verificationToken}`
               transporter.sendMail({
                 to: email,
                 subject: 'Verify Account',
                 html: `Click <a href = '${url}'>here</a> to confirm your email.`
               })
               return res.status(201).send({
                 message: `Sent a verification email to ${email}`
               });
        } else {
            return res.status(201).send({
                message: `Account has been verified`
            });
        }
   } catch(err){
       return res.status(500).send(err);
   }
  }

  exports.verifyEmail = async (req, res) => {
    let token = req.session.token;
    // Check we have an id
    if (!token) {
        return res.status(422).send({ 
             message: "Missing Token" 
        });
    }
    // Step 1 -  Verify the token from the URL
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
        // Step 2 - Find user with matching ID
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

exports.findId = (req, res) => {
    const id = req.params.id;

    User.findById(id)
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
}

exports.create = (req, res) => {
    if(!req.body.username){
        res.status(400).json({
            message: 'Invalid cannot be empty username',
        })
    }
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    })

    user.save(user)
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.status(500).json({
            message: err.message || "error while inserting"
        })
    });
}

exports.update = (req, res) => {
   
}

exports.delete = (req, res) => {
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