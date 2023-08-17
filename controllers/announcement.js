const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
//4/8/23 12:40announcement_mast
app.post("/annomastpost", async (req, res) => {
  console.log("post annomastpost api hit");

  try {
    // Extract data from the request body
    const {
      dept_id,
      desi_id,
      onboard_status,
      heading,
      sub_heading,
      content,

      remarks,
      created_by,
    } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const deptId = dept_id || "";
    const desiId = desi_id || "";
    const onboardStatus = onboard_status || "";
    const Heading = heading || "";
    const subHeading = sub_heading || "";
    const Content = content || "";

    const Remarks = remarks || "";
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();
    // Check if created_by is defined and convert to integer

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO announcement_mast(dept_id,desi_id,onboard_status,heading ,sub_heading ,content,remark,created_by, created_at)
        VALUES (?,?,?,?,?,?,?,?,?)`;

    const values = [
      deptId,
      desiId,
      onboardStatus,
      Heading,
      subHeading,
      Content,
      Remarks,
      created_By,
      creation_date,
    ];

    const result = await connection.promise().query(query, values);

    console.log("annomast added successfully");
    res.status(200).send("annomast added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding annomast to database");
  }
});
// get all data ofannomast
app.get("/allannouncementdata", (req, res) => {
  // console.log("get dept api hit");
  const query = `
      SELECT
        am.*,
        dm.dept_name,
        dm2.desi_name,
        um.onboard_status 
      FROM
        announcement_mast AS am
        LEFT JOIN dept_mast AS dm ON am.dept_id = dm.dept_id
        LEFT JOIN designation_mast  AS dm2 ON am.desi_id = dm2.desi_id
        LEFT JOIN user_mast AS um ON am.onboard_status = um.onboard_status
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// update annomast data
app.put("/annomastupdate", (req, res) => {
  console.log("annomastupdate hitted");
  var d1 = new Date();

  // Extract data from the request body
  const {
    dept_id,
    desi_id,
    onboard_status,
    heading,
    sub_heading,
    content,
    remark,
    Last_updated_by,
  } = req.body;
  const id = req.body.id;

  // Update lead_type record in the database
  connection.query(
    "UPDATE announcement_mast SET dept_id = ?, desi_id = ?, onboard_status = ?, heading = ?, sub_heading = ?, content = ?, remark = ?, Last_updated_by = ?, last_updated_at  = ? WHERE id = ?",
    [
      dept_id,
      desi_id,
      onboard_status,
      heading,
      sub_heading, // Removed the duplicate sub_heading
      content,
      remark,
      Last_updated_by,
      d1.toISOString().split("T")[0], // Convert d1 to the MySQL date format
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `annomast with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `annomast with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// get announcement by status of dept wise user 4/8/23 5:12
app.get("/allannomastdata", (req, res) => {
  // Get the onboard_status and dept_id from the request query parameters
  const onboardStatus = req.query.onboard_status;
  const deptId = req.query.dept_id;

  // Construct the SQL query with conditional filtering based on onboard_status and dept_id
  const query = `
      SELECT
        am.*,
        dm.dept_name,
        dm2.desi_name,
        um.onboard_status 
      FROM
        announcement_mast AS am
        LEFT JOIN dept_mast AS dm ON am.dept_id = dm.dept_id
        LEFT JOIN designation_mast  AS dm2 ON am.desi_id = dm2.desi_id
        LEFT JOIN user_mast AS um ON am.onboard_status = um.onboard_status
      WHERE
        am.onboard_status = ? AND
        am.dept_id = ?
    `;

  // Execute the query with the provided onboard_status and dept_id parameters
  connection.query(query, [onboardStatus, deptId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// 5/8/23
// get announcement by status of dept wise user 4/8/23 5:12
app.get("/allannomastdata", (req, res) => {
  // Get the onboard_status and dept_id from the request query parameters
  const onboardStatus = req.query.onboard_status;
  const deptId = req.query.dept_id;

  // Construct the SQL query with conditional filtering based on onboard_status and dept_id
  const query = `
      SELECT
        am.*,
        dm.dept_name,
        dm2.desi_name,
        um.onboard_status 
      FROM
        announcement_mast AS am
        LEFT JOIN dept_mast AS dm ON am.dept_id = dm.dept_id
        LEFT JOIN designation_mast  AS dm2 ON am.desi_id = dm2.desi_id
        LEFT JOIN user_mast AS um ON am.onboard_status = um.onboard_status
      WHERE
        am.onboard_status = ? AND
        am.dept_id = ?
    `;

  // Execute the query with the provided onboard_status and dept_id parameters
  connection.query(query, [onboardStatus, deptId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
module.exports = app;
