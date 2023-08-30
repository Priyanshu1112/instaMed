// const express = require("express");
const nodemailer = require("nodemailer");
exports.sendmail = (req, res, patient, doctor, user) => {
  // console.log(req, res, patient, doctor, user);
  const userType = patient ? "patient" : doctor ? "doctor" : "admin";
  console.log("in sendmail", userType);
  const pageUrl =
    req.protocol +
    "://" +
    req.get("host") +
    `/${userType}/changePassword/` +
    user._id;
  // console.log(pageUrl);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "raghuwanshi.priyanshu1112@gmail.com",
      pass: "iocclfntwivnwsoj",
    },
  });

  // console.log("mail options", req.body);
  const mailOptions = {
    from: "<raghuwanshi.priyanshu1112@gmail.com>", // sender address
    to: req.body.email, // list of receivers
    subject: "Password Reset Link", // Subject line
    text: "Do not share this link to anyone", // plain text body
    html: `<a href=${pageUrl}>Password Reset Link</a>`, // html body
  };
  // console.log("after mail options");
  transporter.sendMail(mailOptions, (err, info) => {
    // console.log("sendMail");
    if (err) {
      console.log("in transport error", err);
      return err;
    }
    console.log(info);
    user.passwordResetToken = 1;
    console.log("token updated");
    user.save();
    console.log("user saved");
    return res.redirect(
      `/${userType}/forgetPassword?success=Email sent successfully.`
    );
  });
};
