const dbConfig = require("../config/config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require('./users.js')(mongoose);
db.thread = require('./threads.js')(mongoose);
db.role = require('./roles.js');
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;