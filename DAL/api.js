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

function getRecipes(res, orderBy, limit, where) {
  let myQuery = "SELECT * FROM recipes";
  if (orderBy) myQuery += ` ORDER BY ${orderBy} desc`; // TBD
  if (limit) myQuery += ` LIMIT ${limit}`;

  connection.query(myQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function getRecipeById(res, recipeId) {
  connection.query(
    `SELECT * FROM recipes WHERE id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getRecipeInstructions(res, recipeId) {
  connection.query(
    `SELECT * FROM instructions WHERE recipe_id = ${recipeId} ORDER BY step_number ASC`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getRecipeIngredients(res, recipeId) {
  connection.query(
    `SELECT amount, measurement_name, ingredient_name FROM recipe_ingredients 
    JOIN measurements ON measurement_id = measurements.id
    JOIN ingredients ON ingredient_id = ingredients.id
    WHERE recipe_id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

module.exports = {
  getRecipes,
  getRecipeById,
  getRecipeInstructions,
  getRecipeIngredients,
};
