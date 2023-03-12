const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
require('dotenv').config();
const config = require("../config/auth.js");
const validator = require('validator');

module.exports = mongoose => {
  var schema = mongoose.Schema(
      {
        username: {
          type: String,
          unique: true
        },
        name: {
          type: String,
          required: true
        },
        email:{
          type: String,
          unique: true,
          default: null,
          validate: [validator.isEmail, 'Invalid email address']
        },
        image: {
          type: String,
          default: null,
        },
        password: {
          type: String,
          required: true,
        },
        roles: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
          }
        ],
        isPrivate: {
          type: Boolean,
          default: false
        },
        verified: {
          type: Boolean,
          required: true,
          default: false
        },
        isOnline: {
          type: Boolean,
          default: false
        },
        isReal: {
          type: Boolean,
          default: false
        },
        resetPasswordToken: {
          type: String,
          default: null,
        },
      },
      { timestamps: true }
    );

// convert default mongo _id to id
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });

    
    schema.virtual('passwordConfirmation')
    .get(function() {
      return this._passwordConfirmation;
    })
    .set(function(value) {
        this._passwordConfirmation = value;
    });
// hashing password
    schema.pre('save', async function (next) {
      try {
          if (!this.isModified('password')) {
              return next();
          }
          const hashed = await bcrypt.hash(this.password, 10);
          this.password = hashed;
      } catch (err) {
          return next(err);
      }
    });

    schema.pre('findOneAndUpdate', async function () {
      this._update.password = await bcrypt.hash(this._update.password, 10)
    })
    
    
    const User = mongoose.models.user || mongoose.model("user", schema);
    return User;
  };
