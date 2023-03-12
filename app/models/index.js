const dbConfig = require("../config/config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require('./users.js')(mongoose);
db.followeds = require('./followeds.js')(mongoose);
db.follower = require('./followers.js')(mongoose);
db.role = require('./roles.js');
db.circle = require('./circles.js')(mongoose);
db.like = require('./likes.js')(mongoose);
db.post = require('./posts.js')(mongoose);
db.about = require('./abouts.js')(mongoose);
db.profile = require('./profiles.js')(mongoose);
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;