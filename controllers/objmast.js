const express = require("express");
const app = express.Router();

const connection = require("../db");
app.get("/objdata/:id", (req, res) => {
  const objId = req.params.id;
  console.log(`Retrieving object with ID ${objId}`);

  const query = `
      SELECT o.*, d.dept_name
      FROM object_mast AS o
      LEFT JOIN dept_mast AS d ON o.dept_id = d.dept_id
      WHERE o.obj_id = ${objId}
    `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    if (results.length === 0) {
      res.sendStatus(404); // Send HTTP status code 404 if object not found
      return;
    }

    const data = results[0]; // Retrieve the first row (assuming obj_id is unique)

    res.send({ data: data }); // Send the data back to the client
  });
});
// 6/7/23 object_mast post with trigger
app.post("/obj", async (req, res) => {
  console.log("post object_mast API hit");

  try {
    // Extract data from the request body
    const { obj_name, soft_name, dept_id, created_by } = req.body;

    const objName = obj_name || "";
    const softName = soft_name || "";
    const deptId = dept_id || 0;
    const createdBy = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const creationDate = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Insert the new object into the object_mast table
    const insertObjectQuery = `INSERT INTO object_mast (obj_name, soft_name, dept_id, Creation_date, Created_by)
        VALUES (?, ?, ?, ?, ?)`;

    const objectValues = [objName, softName, deptId, creationDate, createdBy];

    // Execute the insert query for the object
    const objectResult = await connection
      .promise()
      .query(insertObjectQuery, objectValues);
    const objectId = objectResult[0].insertId; // Get the auto-generated obj_id

    // Get all users from the user_mast table
    const selectUsersQuery = `SELECT user_id, role_id FROM user_mast`;

    const usersResult = await connection.promise().query(selectUsersQuery);
    const users = usersResult[0]; // Array of user data from user_mast table

    // Insert user_auth_detail for each user and the new object
    const insertUserAuthQuery = `INSERT INTO user_auth_detail (Juser_id, obj_id, insert_value, view_value, update_value, delete_flag_value, Creation_date, Created_by, Last_updated_by, Last_updated_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const user of users) {
      const userId = user.user_id;
      const roleId = user.role_id;
      let insertValue = 0;
      let viewValue = 0;
      let updateValue = 0;
      let deleteValue = 0;

      if (roleId === 1) {
        insertValue = 1;
        viewValue = 1;
        updateValue = 1;
        deleteValue = 1;
      }

      const userAuthValues = [
        userId,
        objectId,
        insertValue,
        viewValue,
        updateValue,
        deleteValue,
        creationDate,
        createdBy,
        createdBy,
        creationDate,
      ];

      // Execute the insert query for user_auth_detail for each user and the new object
      await connection.promise().query(insertUserAuthQuery, userAuthValues);
    }

    console.log("Object and user_auth_detail added successfully");
    res.status(200).send("Object and user_auth_detail added successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error adding object and user_auth_detail to database: " + error.message
      );
  }
});

app.get("/allobj", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * FROM object_mast`, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
module.exports = app;
