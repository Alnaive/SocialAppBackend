require('dotenv').config();
const config = require("../config/auth.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Profile = db.profile;
const About = db.about;
const validator = require('validator');

const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

exports.signup = async (req, res) => {
  const { username, name, email, password, passwordConfirmation, title, city, birtday, nationality, hobby, about, roles } = req.body;

  // Validate password length
  if (!validator.isLength(password && passwordConfirmation, { min: 8, max: 30 })) {
    return res.status(400).json({ error: 'Password should be at least 8 characters and max 30 characters.' });
  }

  // Validate matching passwords
  if (password !== passwordConfirmation) {
    return res.status(400).json({ message: 'Password does not match.' });
  }

  // Create user and profile
  try {
    const user = new User({ username, name, email, password });
    const profile = new Profile({ owner: user.id, title, city, birtday, nationality, hobby });
    const about = new About({ owner: user.id });
    await user.save();
    await profile.save();
    await about.save();

    // Assign roles
    const roleIds = [];
    if (roles) {
      const foundRoles = await Role.find({ name: { $in: roles } });
      roleIds = foundRoles.map(role => role._id);
    } else {
      const foundRole = await Role.findOne({ name: 'user' });
      roleIds.push(foundRole._id);
    }
    user.roles = roleIds;
    await user.save();

    // Generate and return JWT token
    const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
    return res.status(200).json({
      auth: true,
      id: user.id,
      username,
      email,
      accessToken: token,
      message: 'User was registered successfully!'
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};


exports.signin = (req, res) => {
  User.findOne({
    $or: [
      {username: req.body.username},
      {email: req.body.email}
  ]  })
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

      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
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