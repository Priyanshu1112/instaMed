var express = require("express");
var router = express.Router();
const UserModel = require("../models/userModel");
const PatientModel = require("../models/patientModel");
const DoctorModel = require("../models/doctorModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(UserModel.authenticate()));

router.get("/", (req, res) => {
  try {
    res.redirect("/patient/signInPatient");
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
