require('dotenv').config();
const connectionString = process.env.ATLAS_URI;

module.exports = {
     url: connectionString,
}