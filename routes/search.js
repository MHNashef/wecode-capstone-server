var express = require("express");
var router = express.Router();
const { getSearchRes, getSearchCount } = require("../DAL/api");

router.get("/:searchStr", function (req, res) {
  getSearchRes(res, req.params.searchStr);
});

router.get("/:searchStr/count", (req, res) => {
  getSearchCount(res, req.params.searchStr);
});

router.get("/:searchStr/l/:limit/p/:page", function (req, res) {
  getSearchRes(res, req.params.searchStr, null, req.params.limit, req.params.page);
});

module.exports = router;
