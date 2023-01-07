require('dotenv').config();

module.exports = {
    secret: process.env.SECRET_TOKEN_KEY,
    jwtExp: 3600,           // 1 hour
    jwtRefreshExp: 86400,   // 24 hours
  };