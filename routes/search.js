var express = require("express");
var router = express.Router();
const {getSearchRes} = require("../DAL/api");

router.get("/:searchStr", function (req, res) {
    getSearchRes(res, req.params.searchStr);
});

module.exports = router;