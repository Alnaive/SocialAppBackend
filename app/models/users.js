const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
require('dotenv').config();
const config = require("../config/auth.js");

module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        username: {
          type: String,
          unique: true
        },
        email:{
          type: String,
          unique: true
        },
        password: String,
        roles: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
          }
        ],
        verified: {
          type: Boolean,
          required: true,
          default: false
        },
        resetPasswordToken: {
          type: String,
          default: '',
        }
      },
      { timestamps: true }
    );

// convert default mongo _id to id
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
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
   
    const User = mongoose.models.user || mongoose.model("user", schema);
    return User;
  };
