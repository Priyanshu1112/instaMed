const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/patientRegistration")
  .then(() => {
    console.log("db connected");
  })
  .catch((e) => {
    console.log(e);
  });
