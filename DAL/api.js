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

function getRecipes(res, orderBy, limit, page) {
  let myQuery =
    "SELECT recipes.*, images.img_path FROM recipes JOIN images ON images.id = recipes.image";

  if (orderBy) myQuery += ` ORDER BY ${orderBy} desc`; 
  if (limit) {
    if (page) {
      const offset = Number(limit) * (Number(page) - 1);
      myQuery += ` LIMIT ${offset}, ${limit}`;
    } else {
      myQuery += ` LIMIT ${limit}`;
    }
  }

  connection.query(myQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}
function getRecipesCount(res) {
  connection.query(
    "SELECT COUNT(*) AS 'count' FROM recipes JOIN images ON images.id = recipes.image",
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getRecipeById(res, recipeId) {
  connection.query(
    `SELECT * FROM recipes JOIN images ON images.id = recipes.image WHERE recipes.id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getUserRecipes(res, userId) {
  connection.query(
    `SELECT * FROM recipes JOIN images ON images.id = recipes.image WHERE recipes.user_id = ${userId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function setAsFavorite(res, body) {
  connection.query(
    `INSERT INTO favorites(user_id, recipe_id) VALUES (${body.userId}, ${body.recipeId})`,
    (err, result) => {
      if (err) throw err;
    }
  );
}

function rmvFromFavorites(res, body) {
  connection.query(
    `DELETE FROM favorites WHERE user_id = ${body.userId} AND recipe_id = ${body.recipeId}`,
    (err, result) => {
      if (err) throw err;
    }
  );
}

function getFavRecipes(res, userId) {
  connection.query(
    `SELECT recipes.*, images.img_path FROM favorites 
  JOIN recipes ON favorites.recipe_id = recipes.id 
  JOIN images ON images.id = recipes.image
  WHERE favorites.user_id = ${userId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getIsFavorite(res, userId, recipeId) {
  connection.query(
    `SELECT COUNT(*) as count FROM favorites WHERE user_id = ${userId} AND recipe_id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getMealTypes(res) {
  connection.query(`SELECT * FROM meal_type`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function getRecipeMealType(res, recipeId) {
  connection.query(
    `SELECT * FROM recipe_meal_type JOIN meal_type ON meal_type_id = id WHERE recipe_id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getDietTypes(res) {
  connection.query(`SELECT * FROM diet_type`, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
}

function getRecipeDietType(res, recipeId) {
  connection.query(
    `SELECT * FROM recipe_diet_type JOIN diet_type ON diet_type_id = id WHERE recipe_id = ${recipeId}`,
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
    `SELECT ingredient_id, measurement_id, amount, measurement_name, ingredient_name, notes FROM recipe_ingredients 
    JOIN measurements ON measurement_id = measurements.id
    JOIN ingredients ON ingredient_id = ingredients.id
    WHERE recipe_id = ${recipeId}`,
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
}

function getUserDietType(res, user_id) {
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
          
          res.cookie("sessionid", sessionid);
          res.status(200).json(result);
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
  if (userid && sessionid) {
    connection.query(
      `SELECT last_login FROM users WHERE id = ${userid} AND session_id = '${sessionid}'`,
      (err, result) => {
        if (err) throw err;

        let validSession = false;

        if (result[0]?.last_login) {
          const sessionDate = new Date(result[0].last_login);
          const today = new Date();
          const sessionValidFor = validity * 60 * 60 * 1000; 

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
function updateRecipe(res, recipe) {
  const recipeId = recipe.recipe_id;

  console.log(recipe);
  try {
    connection.query(
      `UPDATE recipes SET recipe_name = '${recipe.recipeName}', general_info = '${recipe.recipeDescription}', image= '${recipe.image}', public = ${recipe.visibility} WHERE (id = ${recipeId});`,
      (err, result) => {
        if (err) throw err;
        console.log(result);

        connection.query(
          `DELETE FROM recipe_ingredients WHERE recipe_id = ${recipeId}`,
          (err, result) => {
            if (err) throw err;
            console.log(result);

            recipe.ingredients.forEach(
              (ingredient) => {
                connection.query(`INSERT INTO recipe_ingredients (recipe_id, amount, measurement_id, ingredient_id, notes)
                VALUES (${recipeId}, ${ingredient.amount}, ${ingredient.measurement_id}, ${ingredient.ingredient_id}, '${ingredient.notes}')`);
              },
              (err, result) => {
                if (err) throw err;
              }
            );
          }
        );

        connection.query(
          `DELETE FROM instructions WHERE recipe_id = ${recipeId}`,
          (err, result) => {
            if (err) throw err;
            console.log(result);

            recipe.instructions.forEach(
              (instruction) => {
                connection.query(`INSERT INTO instructions (recipe_id, step_number, step_description)
                  VALUES (${recipeId}, ${instruction.step_number}, '${instruction.step_description}')`);
              },
              (err, result) => {
                if (err) throw err;
              }
            );
          }
        );

        connection.query(
          `DELETE FROM recipe_diet_type WHERE recipe_id = ${recipeId}`,
          (err, result) => {
            if (err) throw err;
            console.log(result);

            recipe.dietType.forEach(
              (type) => {
                connection.query(`INSERT INTO recipe_diet_type (recipe_id, diet_type_id)
                  VALUES (${recipeId}, ${type})`);
              },
              (err, result) => {
                if (err) throw err;
              }
            );
          }
        );

        connection.query(
          `DELETE FROM recipe_meal_type WHERE recipe_id = ${recipeId}`,
          (err, result) => {
            if (err) throw err;
            console.log(result);

            recipe.mealType.forEach(
              (type) => {
                connection.query(`INSERT INTO recipe_meal_type (recipe_id, meal_type_id)
                  VALUES (${recipeId}, ${type})`);
              },
              (err, result) => {
                if (err) throw err;
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
}
function createRecipe(res, recipe) {
  let newRecipeId = 0;
  try {
    connection.query(
      `INSERT INTO recipes (user_id, recipe_name, general_info, views, image, date_created, public)
      VALUES (${recipe.user_id}, '${recipe.recipeName}', '${recipe.recipeDescription}', 0, ${recipe.image} ,NOW(), 1)`,
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
            VALUES (${newRecipeId}, ${instruction.step_number}, '${instruction.step_description}')`);
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

    res.status(200).json({ msg: "Your information has been updated :)" });
  } catch (err) {
    console.log(err);
  }
}

function getSearchCount(res, searchStr) {
  try {
    connection.query(
      `SELECT COUNT(*) as count FROM recipes 
      JOIN images ON recipes.image = images.id 
      WHERE MATCH(recipe_name) AGAINST('${searchStr}')`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  } catch (err) {
    if (err) throw err;
  }
}

function getSearchRes(res, searchStr, orderBy, limit, page) {
  try {
    let myQuery = `SELECT recipes.*, images.img_path 
    FROM recipes 
    JOIN images ON recipes.image = images.id 
    WHERE MATCH(recipe_name) AGAINST('${searchStr}')`;

    if (orderBy) myQuery += ` ORDER BY ${orderBy} desc`;
    if (limit) {
      if (page) {
        const offset = Number(limit) * (Number(page) - 1);
        myQuery += ` LIMIT ${offset}, ${limit}`;
      } else {
        myQuery += ` LIMIT ${limit}`;
      }
    }
    connection.query(myQuery, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } catch (err) {
    if (err) throw err;
  }
}

function getRecipeViews(res, id) {
  try {
    connection.query(
      `SELECT views FROM recipes WHERE id = ${id}`,
      (err, result) => {
        if (err) throw err;
        res.send(result);
      }
    );
  } catch (err) {
    if (err) throw err;
  }
}

function incrementViews(res, recipeId) {
  try {
    connection.query(
      `UPDATE recipes SET views = views + 1 WHERE id = ${recipeId}`,
      (err, result) => {
        if (err) throw err;
      }
    );
  } catch (err) {
    if (err) throw err;
  }
}

module.exports = {
  getRecipes,
  getRecipesCount,
  getRecipeById,
  getMealTypes,
  getRecipeMealType,
  getDietTypes,
  getRecipeDietType,
  getRecipeInstructions,
  getRecipeIngredients,
  startUserSession,
  endUserSession,
  validateUserSession,
  getMeasurements,
  getIngredients,
  updateRecipe,
  createRecipe,
  getUserDietType,
  createNewUser,
  getUserById,
  getUserDiet,
  updateUser,
  getSearchRes,
  getRecipeViews,
  incrementViews,
  getSearchCount,
  getUserRecipes,
  setAsFavorite,
  rmvFromFavorites,
  getFavRecipes,
  getIsFavorite,
};
