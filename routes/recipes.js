var express = require('express');
var router = express.Router();
const { getRecipes, getRecipeById } = require("../DAL/api");


router.get('/', function(req, res, next) {
    getRecipes(res);
});

router.get('/:limit', function(req, res, next) {
  getRecipes(res, null, req.params.limit);
});

router.get('/recent/:limit', function(req, res, next) {
  getRecipes(res, 'date_created', req.params.limit);
});

router.get('/popular/:limit', function(req, res, next) {
  getRecipes(res, 'views', req.params.limit);
});

router.get('/recipeId/:id', function(req, res) {
  getRecipeById(res, req.params.id);
})


module.exports = router;
