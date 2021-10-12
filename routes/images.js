var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "9y_+Y8wV5?",
  database: "recipe_book",
});
connection.connect((err) => {
  if (err) throw err;
});

var storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, "./uploads");
  },
  filename: function (req, file, callBack) {
    const uniqueSuffix =
      Date.now().toString(16).toUpperCase() +
      Math.round(Math.random() * 1e9)
        .toString(16)
        .toUpperCase() +
      path.extname(file.originalname);
    callBack(null, uniqueSuffix);
  },
});
var upload = multer({ storage: storage });

router.post(
  "/imgUpload",
  upload.single("recipeImg"),
  function (req, res, next) {
    const sqlQuery = `INSERT INTO images (img_path) VALUES ('${req.file.path}')`;

    connection.query(sqlQuery, (err, result) => {
      if (err) throw err;
      res.status(200).json({ imgId: result.insertId, imgPath: req.file.path });
    });
  }
);

module.exports = router;
