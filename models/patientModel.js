const mongoose = require("mongoose");

const newPatient = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  avatar: { type: String, default: "default.jpg" },
  passwordResetToken: { type: Number, default: 0 },
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  contact: Number,
  age: Number,
  gender: String,
});

const patient = mongoose.model("Patient", newPatient);

module.exports = patient;
