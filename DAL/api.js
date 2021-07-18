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

function getDietTypes(res, user_id) {
  try {
    if (user_id) {
      connection.query(
        `SELECT * FROM user_diet_type WHERE user_id=${user_id}`,
        (err, result) => {
          if (err) throw err;
          res.send(result);
        }
      );
    } else {
      connection.query(`SELECT * FROM diet_type`, (err, result) => {
        if (err) throw err;
        res.send(result);
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Failed to get diet types" });
  }
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

function createNewUser(res, newUser) {
  if (newUser) {
    try {
      // TBD: might want to first check if there's another user w/ same email
      // or can create this constraint on the DB side
      connection.query(
        `INSERT INTO users (first_name, last_name, user_password, email)
          VALUES('${newUser.first_name}', '${newUser.last_name}', '${newUser.user_password}', '${newUser.email}')`,
        (err, result) => {
          if (err) throw err;

          if (newUser.diettype) {
            newUser.diettype.forEach((element) => {
              connection.query(
                `INSERT INTO user_diet_type (user_id, diet_type_id) VALUES (${result.insertId}, ${element})`,
                (err, result) => {
                  if (err) throw err;
                }
              );
            });
          }
          res?.status(200).json({ msg: "User created" });
        }
      );
    } catch (err) {
      console.log(err);
    }
  } else {
    // TBD: there are other place where this could fail, but queries seem to be async
    // and we can't guarantee serial execution of code. figure a better way of doing this
    res?.status(500).json({ msg: "Update failed" });
  }
}

function getUserById(res, id) {
  connection.query(`SELECT * FROM users WHERE id = ${id}`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function getUserDiet(res, id) {
  connection.query(
    `SELECT diet_type_id FROM user_diet_type WHERE user_id = ${id}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
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
        recipe.ingredients.forEach(
          (ingredient) => {
            connection.query(`INSERT INTO recipe_ingredients (recipe_id, amount, measurement_id, ingredient_id, notes)
            VALUES (${newRecipeId}, ${ingredient.amount}, ${ingredient.measurement_id}, ${ingredient.ingredient_id}, '${ingredient.notes}')`);
          },
          (err, result) => {
            if (err) throw err;
          }
        );

        recipe.instructions.forEach(
          (instruction) => {
            connection.query(`INSERT INTO instructions (recipe_id, step_number, step_description)
            VALUES (${newRecipeId}, ${instruction.stepNum}, '${instruction.instruction}')`);
          },
          (err, result) => {
            if (err) throw err;
          }
        );

        recipe.dietType.forEach(
          (type) => {
            connection.query(`INSERT INTO recipe_diet_type (recipe_id, diet_type_id)
            VALUES (${newRecipeId}, ${type})`);
          },
          (err, result) => {
            if (err) throw err;
          }
        );

        recipe.mealType.forEach(
          (type) => {
            connection.query(`INSERT INTO recipe_meal_type (recipe_id, meal_type_id)
            VALUES (${newRecipeId}, ${type})`);
          },
          (err, result) => {
            if (err) throw err;
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
}

function updateUser(res, userInfo) {
  try {
    connection.query(
      `UPDATE users 
          SET first_name = '${userInfo.first_name}', last_name = '${userInfo.last_name}', 
          user_password = '${userInfo.user_password}', email = '${userInfo.email}'  
          WHERE id = ${userInfo.id}`,
      (err, result) => {
        if (err) throw err;
      }
    );

    connection.query(
      `DELETE FROM user_diet_type WHERE user_id = ${userInfo.id}`,
      (err, result) => {
        if (err) throw err;
      }
    );

    userInfo.diettype.forEach((type) => {
      connection.query(
        `INSERT INTO user_diet_type (user_id, diet_type_id)
          VALUES (${userInfo.id}, ${type})`,
        (err, result) => {
          if (err) throw err;
        }
      );
    });

    res.status(200).json({ msg: "Your information has been updated :)"});
  } catch (err) {
    console.log(err);
  }
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
  getDietTypes,
  createNewUser,
  getUserById,
  getUserDiet,
  updateUser,
};
