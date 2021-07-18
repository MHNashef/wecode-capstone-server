const { json } = require("express");
var express = require("express");
var router = express.Router();
const {
  startUserSession,
  endUserSession,
  validateUserSession,
  getDietTypes,
  createNewUser,
  getUserById,
  getUserDiet,
  updateUser
} = require("../DAL/api");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/userId/:id", function (req, res) {
  getUserById(res, req.params.id);
});

router.get("/diet/:id", function (req, res) {
  getUserDiet(res, req.params.id);
});

router.get("/testuser", function (req, res) {
  startUserSession(res, "hishamnshf@gmail.com", "123Asdf$");
});

router.get("/diettypes", function (req, res) {
  getDietTypes(res, null);
});

router.post("/signup", function (req, res) {
  console.log(req.body);
  if (req.body) {
    createNewUser(res, req.body);
  } else {
    res.status(400).json({ msg: "Bad POST request" });
  }
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

router.put("/updateUser", function (req, res) {
  updateUser(res, req.body);
});

module.exports = router;
