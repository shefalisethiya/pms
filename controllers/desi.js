const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
// 7/7/23 post designation_mast data
app.post("/desi", async (req, res) => {
  console.log("post designation api hit");

  try {
    // Extract data from the request body
    const { desi_name, dept_id, remark, created_by } = req.body;

    // If dept_name is not defined or is empty, set it to an empty string
    const desiName = desi_name || "";

    // Check if remark is defined and convert to string
    const remarkValue = remark || "";
    const created_By = created_by || 0;
    const deptId = dept_id || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query =
      "INSERT INTO designation_mast  (desi_name,dept_id , remark , created_at , created_by ) VALUES (?, ?, ?, ?,?)";
    const values = [
      desiName,
      deptId,
      remarkValue,
      creation_date,
      created_By,
      // locationIdValue,
    ];
    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("Designation added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add designation to database");
  }
});
//get alldesignation
app.get("/alldesi", (req, res) => {
  console.log("Retrieving all designation information");

  const query = `
      SELECT 
        dm.*, 
        d.dept_name AS department_name
      FROM 
        designation_mast AS dm
        LEFT JOIN dept_mast AS d ON dm.dept_id = d.dept_id
    `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.send({ data: data }); // Send the data back to the client
  });
});
// update designation data
app.put("/desidataupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const { desi_name, dept_id, remark, Last_updated_by } = req.body;
  const id = req.body.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    desi_name: desi_name || "",
    remark: remark || "",
    dept_id: dept_id || 0,
    last_updated_by: Last_updated_by || 0,
    last_updated_at: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE designation_mast SET ? WHERE desi_id = ?",
    [updateObject, id],
    (err, result) => {
      if (err) {
        console.log(err);
        // If an error occurs during the update query, send a 500 status code
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        // If no rows were affected by the update query, the sitting record with the provided ID was not found
        const message = `desi record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `desi record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete designation data
app.delete("/desidelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM designation_mast  WHERE desi_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `desi with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `desi with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
