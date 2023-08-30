const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const PatientModel = require("../models/patientModel");
const { sendmail } = require("../utils/mail");
const AppointmentModel = require("../models/appointmentModel");
const DoctorModel = require("../models/doctorModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const patient = require("../models/patientModel");

passport.use(new LocalStrategy(UserModel.authenticate()));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/doctor/signInDoctor");
};

router.get("/signInDoctor", (req, res) => {
  try {
    res.render("authentication/signInDoctor", {
      title: "Sign-In-Doctor",
      error: req.query.error,
      msg: req.query.msg,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/signInDoctor", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(
        "/doctor/signInDoctor?error=Incorrect username or password"
      );
    }
    if (user.role !== "doctor") {
      return res.redirect(
        `/doctor/signInDoctor?error=Try signing in from ${user.role} terminal`
      );
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect("/doctor/profile");
    });
  })(req, res, next);
});

router.get("/signUpDoctor", (req, res) => {
  try {
    res.render("authentication/signUpDoctor", {
      title: "Sign-Up-Doctor",
      error: req.query.error,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/signUpDoctor", async (req, res) => {
  try {
    const role = "doctor";
    const { username, email, age, specialist, contact, password } = req.body;
    const user = await UserModel.register({ username, role }, password);
    const doctor = await DoctorModel.create({
      username,
      email,
      age,
      specialist,
      contact,
      user: user._id,
    });
    user.user = doctor._id;
    await user.save();
    req.logIn(user, (err, user) => {
      if (err) {
      }

      res.redirect("/doctor/profile");
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const appointments = await AppointmentModel.find({ doctor: req.user.user });
    const patients = [];
    await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await PatientModel.findById(appointment.patient);
        patients.push(patient);
      })
    );
    const list = [];
    appointments.forEach((appointment, ind) => {
      list.push({
        patientName: patients[ind].username,
        patientAge: patients[ind].age,
        patientContact: patients[ind].contact,
        patientGender: patients[ind].gender,
        appointmentTime: appointment.time
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        status: appointment.status,
      });
    });
    console.log(list);
    res.render("doctor/profileDoctor", {
      title: "Doctor",
      doctor: req.user,
      list,
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/editDoctor", isLoggedIn, async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.user.user);
    res.render("doctor/editDoctor", {
      title: "Edit-Doctor",
      doctor,
      msg: req.query.msg,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/editDoctor", isLoggedIn, async (req, res) => {
  try {
    await DoctorModel.findByIdAndUpdate(req.user.user, req.body);
    res.redirect("/doctor/editDoctor?msg=Updated Successfully");
  } catch (error) {
    res.send(error);
  }
});

router.get("/deleteDoctor", async (req, res) => {
  try {
    await DoctorModel.findByIdAndDelete(req.user.user);
    await UserModel.findByIdAndDelete(req.user._id);
    res.redirect("/doctor/signInDoctor?msg=Id Deleted successfully");
  } catch (error) {
    res.send(error);
  }
});

router.get("/signOutDoctor", async (req, res) => {
  try {
    req.logOut(req.user, (error) => {
      if (error) {
      }
      res.redirect("/doctor/signInDoctor");
    });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
