const { json } = require("express");
var express = require("express");
var router = express.Router();
const {
  startUserSession,
  endUserSession,
  validateUserSession,
} = require("../DAL/api");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/testuser", function (req, res) {
  startUserSession(res, "hishamnshf@gmail.com", "123Asdf$");
});

router.post("/login", function (req, res) {
  console.log(req.body);
  if (req.body) {
    const email = req.body.email;
    const password = req.body.password;
    try {
      startUserSession(res, email, password);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  } else {
    res.status(400).json({ msg: "Bad POST request" });
  }
});

router.post("/logout", function (req, res) {
  console.log(req.body);
  if (req.body) {
    const sessionid = req.body.sessionid;
    try {
      endUserSession(res, sessionid);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  } else {
    res.status(400).json({ msg: "Bad POST request" });
  }
});

router.post("/validatesession", function (req, res) {
  console.log(req.body);
  if (req.body) {
    const { id, session_id, validity } = req.body;
    try {
      validateUserSession(res, id, session_id, validity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  } else {
    res.status(400).json({ msg: "Bad POST request" });
  }
});

module.exports = router;
