const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
app.post("/role", async (req, res) => {
  console.log("post Role api hit");

  try {
    // Extract data from the request body
    const { role_name, remark, created_by } = req.body;
    console.log("req.body###", req.body);

    const Role_name = role_name || "";
    const remarkValue = remark || "";
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0];

    // Insert the new user into the database using a parameterized query
    const query =
      "INSERT INTO Role_mast (Role_name, Remarks,Created_by,Creation_date) VALUES (?,?,?,?)";
    const values = [Role_name, remarkValue, created_by || 0, creation_date];
    console.log("query##", query);
    const result = await connection.promise().query(query, values);

    // console.log('User added successfully');
    res.status(200).send("Role added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding Role to database");
  }
});
//get all data ofRole_maat
app.get("/allroles", (req, res) => {
  console.log("Retrieving all Role_mast data");

  const query = `SELECT r.*, u.user_name AS created_by_name
    FROM Role_mast AS r
    LEFT JOIN user_mast AS u ON r.created_by = u.user_id`;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable
    // console.log("Retrieved data:", data);
    res.send({ data: data }); // Send the data back to the client
  });
});
//update Role
app.put("/roleupdate", (req, res) => {
  console.log("role update api hit");
  var d1 = new Date();
  console.log("lastupdatedDateTime", d1);
  // Extract data from the request body and URL parameter
  const { role_name, remark, id } = req.body;
  // const { id } = req.params.id;
  console.log("req.body", req.body);
  // console.log("updateroleid##",req.params.id)
  // console.log("updaterole req.body##",req.body);

  connection.query(
    "UPDATE Role_mast SET Role_name = ?,Remarks=?,Last_updated_date=? WHERE Role_id = ?",
    [role_name, remark, d1, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        console.log("result##", result.affectedRows);
        const message = `Role with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Role with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete role
app.delete("/roledelete/:id", (req, res) => {
  console.log("delete api hit");
  const id = req.params.id;
  console.log("id##", id);
  connection.query(
    "DELETE FROM Role_mast WHERE Role_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `role with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `role with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
