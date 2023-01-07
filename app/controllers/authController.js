require('dotenv').config();
const config = require("../config/auth.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
});

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      // using cookies
      req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        // accessToken: token
      });
    });
};

exports.signout = async (req, res) => {
    try {
      req.session = null;
      return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
      this.next(err);
    }
  };

exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  
  const user = await User.findOne({ email });
  if (!user) {
     return res.status(409).send({ 
           message: "Email not found."
     });
   }
  const resetVerificationToken = jwt.sign({ id: user.id }, config.secret, {
   expiresIn: '1d'
 });
  await user.updateOne({resetPasswordToken: resetVerificationToken})

  const url = `http://localhost:8000/api/auth/reset/${resetVerificationToken}`
  transporter.sendMail({
    to: email,
    subject: 'Reset Password',
    html: `Click <a href = '${url}'>here</a> to confirm your email.`
  })
  return res.status(201).send({
    message: `Link reset send to ${email}`
  });
}

exports.resetPassword = async (req, res ) => {
  const { token, password } = req.body;

  if(!token){
    return res.status(403).send({
      message:'missing token'
    })
  }
   // Verify the token from the URL
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
       // Find user token
       const user = await User.findOne({ resetPasswordToken: token }).exec();
       user.password = password;
       await user.save();
       return res.status(200).send({
             message: "Your password has been reset"
       });
    } catch (err) {
       return res.status(500).send(err);
    }
}