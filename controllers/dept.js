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
// 21/8/23 sub_dept post
app.post("/subdept", async (req, res) => {
  console.log("post sub_department API hit");

  try {
    // Extract data from the request body
    const { sub_dept_name, dept_id, remark, created_by } = req.body;

    // Set default values if not provided
    const subDeptName = sub_dept_name || "";
    const deptId = dept_id || 0;
    const remarkValue = remark || "";
    const createdBy = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const createdAt = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Insert the new sub-department into the database using a parameterized query
    const insertQuery =
      "INSERT INTO sub_department (sub_dept_name, dept_id, remark, created_at, created_by) VALUES (?, ?, ?, ?, ?)";
    const insertValues = [
      subDeptName,
      deptId,
      remarkValue,
      createdAt,
      createdBy,
    ];

    // Execute the insert query for the sub-department
    await connection.promise().query(insertQuery, insertValues);

    console.log("Sub-department added successfully");
    res.status(200).send("Sub-department added successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error adding sub-department to the database: " + error.message);
  }
});
//22/8/23 get data of sub_dept
app.get("/allsubdept", (req, res) => {
  connection.query(
    `SELECT s.*, d.dept_name 
    FROM sub_department s
    LEFT JOIN dept_mast d ON s.dept_id = d.dept_id`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.send(results);
    }
  );
});
// update subdept data
app.put("/subdeptupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { id,sub_dept_name, dept_id, remark, last_updated_by } = req.body;

  // Update department record in the database
  connection.query(
    "UPDATE sub_department SET sub_dept_name = ?, dept_id = ?, last_updated_at = ?,last_updated_by=?,remark=? WHERE id = ?",
    [sub_dept_name, dept_id, d1, last_updated_by, remark, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      // if (result.affectedRows === 0) {
      //   const message = `sub_Department with ID ${id} not found`;
      //   res.status(404).send(message);
      //   return;
      // }
      const message = `sub_Department with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
  // delete subdeptdata
  app.delete("/subdeptdelete/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
      "DELETE FROM sub_department WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          // console.error(err);
          res.sendStatus(500);
          return;
        }
        if (results.affectedRows === 0) {
          const message = `subDepartment with ID ${id} not found`;
          res.status(404).send(message);
          return;
        }
        const message = `subDepartment with ID ${id} deleted successfully`;
        res.status(200).send({ message });
      }
    );
  });
});

app.delete("/subdeptdelete/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "DELETE FROM sub_department WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `subDepartment with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `subDepartment with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// get sub_dept by dept_id
app.get("/subdept/:dept_id", (req, res) => {
  const deptId = req.params.dept_id;

  connection.query(
    `SELECT s.*, d.dept_name 
    FROM sub_department s
    LEFT JOIN dept_mast d ON s.dept_id = d.dept_id
    WHERE s.dept_id = ?`,
    [deptId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.send(results);
    }
  );
});

//23/08/2023 get by id
app.get("/subdeptbyid/:id", (req, res) => {
  const id = req.params.id;
  console.log(`Retrieving sub department by  ID: ${id}`);

  const query = `SELECT s.*, d.dept_name 
  FROM sub_department s
  LEFT JOIN dept_mast d ON s.dept_id = d.dept_id
  WHERE s.id = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    res.send(results[0]);
  })  

});

module.exports = app;
