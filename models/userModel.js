const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const newUser = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId },
  username: { type: String, required: true, unique: true },
  password: String,
  role: String,
});

newUser.plugin(plm);

const user = mongoose.model("Users", newUser);

module.exports = user;
