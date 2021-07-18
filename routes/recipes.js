var express = require("express");
var router = express.Router();
const {
  getRecipes,
  getRecipeById,
  getMealTypes,
  getRecipeMealType,
  getDietTypes,
  getRecipeDietType,
  getRecipeInstructions,
  getRecipeIngredients,
  getMeasurements,
  getIngredients,
  createRecipe,
  updateRecipe,
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
  // getRecipeById((result) => res.send(result), req.params.id);
});
router.get("/list/mealtypes", function (req, res) {
  getMealTypes(res);
});

router.get("/recipeId/:id/mealtype", function (req, res) {
  getRecipeMealType(res, req.params.id);
});

router.get("/list/diettypes", function (req, res) {
  getDietTypes(res);
});

router.get("/recipeId/:id/diettype", function (req, res) {
  getRecipeDietType(res, req.params.id);
});
router.get("/recipeId/:id/instructions", function (req, res) {
  getRecipeInstructions(res, req.params.id);
});

router.get("/recipeId/:id/ingredients", function (req, res) {
  getRecipeIngredients(res, req.params.id);
});

router.get("/get/measurements", function (req, res) {
  getMeasurements(res);
});

router.get("/get/ingredients", function (req, res) {
  getIngredients(res);
});

router.post("/create/recipe", function(req, res) {
  createRecipe(res, req.body);
});
router.put("/update/recipe", function (req, res) {
  updateRecipe(res, req.body);
});
module.exports = router;
