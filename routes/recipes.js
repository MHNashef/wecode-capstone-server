var express = require("express");
var router = express.Router();
const {
  getRecipes,
  getRecipesCount,
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
  getRecipeViews,
  incrementViews,
  getSearchCount,
  getUserRecipes
} = require("../DAL/api");

router.get("/", function (req, res) {
  getRecipes(res, 'date_created');
});

router.get("/popular", function (req, res) {
  getRecipes(res, 'views');
});

router.get("/count", function (req, res) {
  getRecipesCount(res);
});

router.get("/l/:limit/p/:page", function (req, res) {
  getRecipes(res, "date_created", req.params.limit, req.params.page);
});

router.get("/l/:limit/p/:page/popular", function (req, res) {
  getRecipes(res, "views", req.params.limit, req.params.page);
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

router.get("/recipe/userId/:userId", function (req, res) {
  getUserRecipes(res, req.params.userId);
})

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

router.get("/get/views/:id", function (req, res) {
  getRecipeViews(res, req.params.id);
})

router.post("/create/recipe", function(req, res) {
  createRecipe(res, req.body);
});

router.put("/increment/views/:recipeId", function(req, res) {
  incrementViews(res, req.params.recipeId);
})

router.put("/update/recipe", function (req, res) {
  updateRecipe(res, req.body);
});
module.exports = router;
