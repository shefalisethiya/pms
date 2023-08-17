const express = require("express");
const app = express.Router();
// const multer = require("multer");

const connection = require("../db");
//post department data
app.post("/dept", async (req, res) => {
  console.log("post department api hit");

  try {
    // Extract data from the request body
    const { dept_name, remark, created_by } = req.body;

    // If dept_name is not defined or is empty, set it to an empty string
    const deptName = dept_name || "";

    // Check if remark is defined and convert to string
    const remarkValue = remark || "";
    const created_By = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query =
      "INSERT INTO dept_mast (dept_name, Remarks, Creation_date, Created_by) VALUES (?, ?, ?, ?)";
    const values = [
      deptName,
      remarkValue,
      creation_date,
      created_By,
      // locationIdValue,
    ];
    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("Department added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add department to database");
  }
});

// API to get all dataofdept
app.get("/alldept", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from dept_mast`, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// get dept by id
app.get("/alldept/:dept_id", (req, res) => {
  const deptId = req.params.dept_id;
  console.log(`Retrieving department information for dept_id: ${deptId}`);

  const query = `SELECT * FROM dept_mast WHERE dept_id = ?`;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [deptId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    if (results.length === 0) {
      res.sendStatus(404); // Send HTTP status code 404 if no department is found
      return;
    }

    const data = results[0]; // Store the retrieved data in a variable

    res.send({ data: data }); // Send the data back to the client
  });
});
//update deptdata
app.put("/deptupdate/:id", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { dept_name, remark } = req.body;
  const id = req.params.id;

  // Update department record in the database
  connection.query(
    "UPDATE dept_mast SET dept_name = ?, Remarks = ?, Last_updated_date = ? WHERE dept_id = ?",
    [dept_name, remark, d1, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `Department with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Department with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});

// delete deptdata
app.delete("/deptdelete/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "DELETE FROM dept_mast WHERE dept_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Department with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Department with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
