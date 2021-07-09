var express = require("express");
var router = express.Router();
const {
  getRecipes,
  getRecipeById,
  getRecipeInstructions,
  getRecipeIngredients,
} = require("../DAL/api");

router.get("/", function (req, res) {
  getRecipes(res);
});

router.get("/:limit", function (req, res) {
  getRecipes(res, null, req.params.limit);
});

router.get("/recent/:limit", function (req, res) {
  getRecipes(res, "date_created", req.params.limit);
});

router.get("/popular/:limit", function (req, res) {
  getRecipes(res, "views", req.params.limit);
});

router.get("/recipeId/:id", function (req, res) {
  getRecipeById(res, req.params.id);
});

router.get("/recipeId/:id/instructions", function (req, res) {
  getRecipeInstructions(res, req.params.id);
});

router.get("/recipeId/:id/ingredients", function (req, res) {
  getRecipeIngredients(res, req.params.id);
});

module.exports = router;
