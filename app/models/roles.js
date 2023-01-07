
// module.exports = mongoose => {

//   var schema = mongoose.Schema(
//     {
//       name: String,
//     },
//   );

//   const Role = mongoose.models.role || mongoose.model("role", schema);
//   return Role;
// };

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const Role = mongoose.models.role || mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
  })
);

module.exports = Role;