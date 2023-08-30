const mongoose = require("mongoose");

const newDoctor = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  passwordResetToken: { type: Number, default: 0 },
  avatar: { type: String, default: "default.jpg" },
  username: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address",
    ],
  },
  specialist: String,
  age: Number,
  contact: Number,
});

const doctor = mongoose.model("Doctor", newDoctor);

module.exports = doctor;
