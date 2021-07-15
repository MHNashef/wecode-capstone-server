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

module.exports = {
  getRecipes,
  getRecipeById,
  getRecipeInstructions,
  getRecipeIngredients,
  startUserSession,
  endUserSession,
  validateUserSession,
};
