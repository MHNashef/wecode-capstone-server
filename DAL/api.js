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
// function getRecipeById(callback, recipeId) {
//   connection.query(
//     `SELECT * FROM recipes WHERE id = ${recipeId}`,
//     (err, result) => {
//       if (err) throw err;
//       callback(result);
//     }
//   );
// }

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

function startUserSession(res, userName, pwd) {
  if (userName && pwd) {
    // check username & pwd
    connection.query(
      `SELECT id, first_name, last_name FROM users WHERE email = '${userName}' AND user_password = '${pwd}'`,
      (err, result) => {
        if (err) throw err;

        // if we get a userid build sessionid
        if (result[0]?.id) {
          console.log("result id: " + result[0].id);
          const sessionid =
            Date.now().toString(16).toUpperCase() +
            Math.round(Math.random() * 1e9)
              .toString(16)
              .toUpperCase() +
            Math.round(Number(result[0].id) * 1e5)
              .toString(16)
              .toUpperCase();
          // set new object to send back
          result[0].session_id = sessionid;

          // update db w/ new sessionid & date
          connection.query(
            `UPDATE users SET session_id = '${sessionid}', last_login = NOW() WHERE id = ${result[0].id};`,
            (err, result) => {
              if (err) throw err;
            }
          );
          // TBD: this is setting cookie on Postman but not on client (why?)
          res.cookie("sessionid", sessionid);
          res.status(200).json(result);
          //res.send(result);
        } else {
          // user login attempt failed
          res.status(403).json({ msg: "Login failed!" });
        }
      }
    );
  } else {
    res.status(403).json({ msg: "Invalid username or password" });
  }
}

function endUserSession(res, sessionid) {
  if (sessionid) {
    connection.query(
      `UPDATE users SET session_id = null WHERE session_id = '${sessionid}';`,
      (err, result) => {
        if (err) throw err;
      }
    );
    res.status(200);
  } else {
    res.status(400).json({ msg: "Invalid session ID" });
  }
}

function validateUserSession(res, userid, sessionid, validity) {
  //TBD: we're only validating session here so better to move to a different function
  if (userid && sessionid) {
    connection.query(
      `SELECT last_login FROM users WHERE id = ${userid} AND session_id = '${sessionid}'`,
      (err, result) => {
        if (err) throw err;

        let validSession = false;

        if (result[0]?.last_login) {
          const sessionDate = new Date(result[0].last_login);
          const today = new Date();
          const sessionValidFor = validity * 60 * 60 * 1000; // in millisecs

          console.log("sessionDate: " + sessionDate);
          if (Math.abs(today - sessionDate) < sessionValidFor)
            validSession = true;
        }

        res.status(200).json({ valid_session: validSession });
      }
    );
  } else {
    res.status(400).json({ msg: "Invalid session and user ids" });
  }
}

function getMeasurements(res) {
  connection.query("SELECT * FROM measurements", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function getIngredients(res) {
  connection.query("SELECT * FROM ingredients", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function createRecipe(res, recipe) {
  let newRecipeId = 0;
  //   //   let addedInstructions = false;
  //   //   let addedIngredients = false;
  //
  console.log(recipe);
  try {
    connection.query(
      // TBD: fix user id
      `INSERT INTO recipes (user_id, recipe_name, general_info, views, image, date_created, public)
      VALUES (7, '${recipe.recipeName}', '${recipe.recipeDescription}', 0, 'uploads/oatmeal.jpeg' ,NOW(), ${recipe.visibility})`,
      (err, result) => {
        if (err) throw err;
        console.log(result);

        newRecipeId = result.insertId;
        recipe.ingredients.forEach((ingredient) => {
          connection.query(`INSERT INTO recipe_ingredients (recipe_id, amount, measurement_id, ingredient_id, notes)
            VALUES (${newRecipeId}, ${ingredient.amount}, ${ingredient.measurement_id}, ${ingredient.ingredient_id}, '${ingredient.notes}')`);
        }, (err, result) => {
            if (err) throw err;
        });

        recipe.instructions.forEach((instruction) => {
          connection.query(`INSERT INTO instructions (recipe_id, step_number, step_description)
            VALUES (${newRecipeId}, ${instruction.stepNum}, '${instruction.instruction}')`);
        }, (err, result) => {
            if (err) throw err;
        });

        recipe.dietType.forEach((type) => {
          connection.query(`INSERT INTO recipe_diet_type (recipe_id, diet_type_id)
            VALUES (${newRecipeId}, ${type})`);
        }, (err, result) => {
            if (err) throw err;
        });

        recipe.mealType.forEach((type) => {
          connection.query(`INSERT INTO recipe_meal_type (recipe_id, meal_type_id)
            VALUES (${newRecipeId}, ${type})`);
        }, (err, result) => {
            if (err) throw err;
        });
      }
    );
  } catch (err) {
    console.log(err);
  }

  //   try {
  //     connection.query(
  //         `INSERT INTO recipes (user_id, recipe_name, general_info, views, date_created, public)
  //       VALUES (1, 'gg', 'gfg',
  //         0, NOW(), 0)`,
  //     //     `INSERT INTO recipes (user_id, recipe_name, general_info, views, date_created, public)
  //     //   VALUES (${recipe.user_id}, '${recipe.recipe_name}', '${
  //     //       recipe.general_info
  //     //     }',
  //     //     0, NOW(), b'${recipe.public ? 1 : 0}')`,
  //         (err, result) => {
  //             if (err) throw err;

  //             connection.query(
  //           `SELECT MAX(id) as last_id from recipes`,
  //           (err, result) => {
  //             if (err) throw err;

  //             if (result[0]?.last_id) {
  //               // we have the new recipe id, now let's add the ingredients & instructions
  //               recipe_id = result[0].last_id;

  //               if (recipe.ingredients) {
  //                 // add ingredients
  //                 recipe.ingredients.forEach((element) => {
  //                   connection.query(
  //                     `INSERT INTO recipe_ingredients (recipe_id, amount, measurement_id, ingredient_id, notes)
  //                 VALUES (${recipe_id}, element.amount, element.measurement_id, element.ingredient_id, 'element.notes')`,
  //                     (err, result) => {
  //                       if (err) throw err;
  //                     }
  //                   );
  //                 });
  //                 addedIngredients = true;
  //               }

  //               if (recipe.instructions) {
  //                 // add instructions
  //                 recipe.instructions.forEach((element) => {
  //                   connection.query(
  //                     `INSERT INTO instructions (recipe_id, step_number, step_description)
  //                 VALUES (${recipe_id}, element.step_number, 'element.step_description')`,
  //                     (err, result) => {
  //                       if (err) throw err;
  //                     }
  //                   );
  //                 });
  //                 addedInstructions = true;
  //               }
  //             }
  //           }
  //         );
  //       }
  //     );
  //   } catch (err) {
  //     console.log(err);
  //     console.log(`Delete recipe: ${recipe_id} failed`);
  //   }

  //   if (recipe_id > 0 && addedInstructions && addedIngredients) {
  //     res?.status(200).json({ recipe_id: `${recipe_id}` });
  //   } else {
  //     if (recipe_id > 0) {
  //       deleteRecipe(null, recipe_id);
  //     }
  //     res?.status(500).json({ recipe_id: "Create new recipe failed" });
  //   }
}

module.exports = {
  getRecipes,
  getRecipeById,
  getRecipeInstructions,
  getRecipeIngredients,
  startUserSession,
  endUserSession,
  validateUserSession,
  getMeasurements,
  getIngredients,
  createRecipe,
};

// {
//     "recipe_name":"Food",
//     "general_info":"very good food",
//     "public": "1",
//     "recipe_diet_type":["3"],
//     "recipe_meal_type":["3"],
//     "ingredients":[
//         {
//             "amount":"1",
//             "measurement_id": "1",
//             "ingredient_id": "1",
//             "notes":"stam note"
//         }
//     ],
//     "instructions":[
//         {
//             "step_number":"1",
//             "step_description": "stam instruction"
//         }
//     ]
// }

// {
//     recipeName: 'food',
//     recipeDescription: 'very good food',
//     visibility: '1',
//     dietType: [ '1' ],
//     mealType: [ '1' ],
//     ingredients: [
//       {
//         id: 0,
//         amount: '1',
//         measurement_id: '1',
//         ingredient_id: '2',
//         notes: 'asdf'
//       }
//     ],
//     instructions: [ { '0': [Object], stepNum: '1', instruction: 'asdf' } ]
//   }
