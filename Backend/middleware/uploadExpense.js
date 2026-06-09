// middleware/uploadExpense.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(
      null,
      "uploads/expenditure"
    );
  },

filename: (req, file, cb) => {

  console.log(
    "UPLOADED FILE:",
    file.originalname
  );

  cb(
    null,
    file.originalname
  );
},
});

module.exports = multer({
  storage,
});