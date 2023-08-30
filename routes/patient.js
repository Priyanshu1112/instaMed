const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const PatientModel = require("../models/patientModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const AppointmentModel = require("../models/appointmentModel");
const DoctorModel = require("../models/doctorModel");
const upload = require("../utils/multer");
const fs = require("fs");

passport.use(new LocalStrategy(UserModel.authenticate()));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/patient/signInPatient");
};

router.get("/signInPatient", (req, res) => {
  try {
    res.render("authentication/signInPatient", {
      title: "Sign-In-Patient",
      error: req.query.error,
      msg: req.query.msg,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/signInPatient", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect(
        "/patient/signInPatient?error=Incorrect username or password"
      );
    }
    if (user.role !== "patient") {
      return res.redirect(
        `/patient/signInPatient?error=Try signing in from ${user.role} terminal`
      );
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect("/patient/profile");
    });
  })(req, res, next);
});

router.get("/signUpPatient", (req, res) => {
  try {
    res.render("authentication/signUpPatient", {
      title: "Sign-Up-Patient",
      img: "default.png",
      error: req.query.error,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/signUpPatient", upload.single("avatar"), async (req, res) => {
  try {
    const role = "patient";
    const { username, email, age, gender, contact, password } = req.body;
    const avatar = req.file !== undefined ? req.file.filename : "default.png";

    var user = await UserModel.register({ username, role }, password);
    const patient = await PatientModel.create({
      username,
      email,
      age,
      gender,
      contact,
      avatar,
      user: user._id,
    });
    user.user = patient._id;
    await user.save();
    res.redirect("/");
  } catch (error) {
    console.log("error", error);
    res.send(error);
  }
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const { msg } = req.query;
    const patient = await PatientModel.findById(req.user.user);
    const appointments = await AppointmentModel.find({ patient: req.user.id });
    // console.log(appointments);
    const doctors = await DoctorModel.find();
    // console.log(doctors);
    res.render("patient/profilePatient", {
      title: "Patient",
      patient,
      doctors,
      appointments,
      msg,
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/editPatient", isLoggedIn, async (req, res) => {
  try {
    const patient = await PatientModel.findById(req.user.user);
    // console.log(patient);
    res.render("patient/editPatient", {
      title: "Edit-Patient",
      patient,
      msg: req.query.msg,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/editPatient",
  upload.single("avatar"),
  isLoggedIn,
  async (req, res) => {
    try {
      // console.log(req.body);
      const patient = await PatientModel.findById(req.user.user);
      // console.log(patient.avatar, req.file.filename);
      if (patient.avatar !== "default.png" && req.file.filename !== undefined) {
        // console.log("delteting");
        fs.unlinkSync("./public/images/" + patient.avatar);
      }

      await PatientModel.findByIdAndUpdate(req.user.user, req.body);
      patient.avatar = req.file.filename;
      await patient.save();
      res.redirect("/patient/editPatient?msg=Updated successfully");
    } catch (error) {
      res.send(error);
    }
  }
);

router.get("/deletePatient", async (req, res) => {
  try {
    await PatientModel.findByIdAndDelete(req.user.user);
    await UserModel.findByIdAndDelete(req.user.id);
    req.logOut(req.user, async (err) => {
      if (err) {
      }
      res.redirect("/patient/signInPatient?msg=Id deleted successfully");
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/signOutPatient", (req, res) => {
  try {
    console.log("sign out");
    req.logOut(req.user, (err) => {
      if (err) {
      }
      res.redirect("/patient/signInPatient");
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/changePassword", isLoggedIn, async (req, res) => {
  try {
    res.render("patient/changePassword", {
      title: "Change-Password",
      patient: await PatientModel.findById(req.user.user),
      err: req.query.err,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post("/changePassword", isLoggedIn, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await req.user.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        return res.redirect("/patient/changePassword?err=" + err.message);
      }
      return res.redirect("/patient/profile?msg=Password changed successfully");
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.post("/bookappointment", isLoggedIn, async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.body.dId);
    await AppointmentModel.create({
      patient: req.user.user,
      doctor: req.body.dId,
      doctorName: doctor.username,
      specialist: doctor.specialist,
      contact: doctor.contact,
    });
    res.redirect("/patient/profile?msg=Request Sent for appointment");
  } catch (error) {
    res.send(error);
  }
});

router.get("/appointmentPatient", isLoggedIn, async (req, res) => {
  try {
    const appointments = await AppointmentModel.find({
      patient: req.user.user,
    });
    res.render("patient/appointmentPatient", {
      title: "Appointments",
      patient: await PatientModel.findById(req.user.user),
      appointments,
      msg: req.query.msg,
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/deleteAppointment/:id", async (req, res) => {
  try {
    await AppointmentModel.findByIdAndDelete(req.params.id);
    res.redirect(
      "/patient/appointmentPatient?msg=Appointment deleted successfully"
    );
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
