var express = require("express");
var router = express.Router();
const { getSearchRes, getSearchCount } = require("../DAL/api");

router.get("/:searchStr", function (req, res) {
  getSearchRes(res, req.params.searchStr, "date_created");
});

router.get("/:searchStr/popular", function (req, res) {
  getSearchRes(res, req.params.searchStr, "views");
});

router.get("/:searchStr/count", (req, res) => {
  getSearchCount(res, req.params.searchStr);
});

router.get("/:searchStr/l/:limit/p/:page", function (req, res) {
  getSearchRes(res, req.params.searchStr, "date_created", req.params.limit, req.params.page);
});

router.get("/:searchStr/l/:limit/p/:page/popular", function (req, res) {
  getSearchRes(res, req.params.searchStr, "views", req.params.limit, req.params.page);
});

module.exports = router;
