const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
// 9/8/23 kra transfer post api
app.post("/kratranspost", async (req, res) => {
  console.log("POST /kratranspost API hit");

  try {
    // Extract data from the request body
    const {
      user_to_id,
      user_from_id,
      job_responsibility_id,
      remarks,
      created_by,
      Job_res_id,
    } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const userToId = user_to_id || "";
    const userFromId = user_from_id || "";
    const jobResponsibilityId = job_responsibility_id || "";
    const Remarks = remarks || "";
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    console.log("userToId:", userToId);
    console.log("userFromId:", userFromId);
    console.log("jobResponsibilityId:", jobResponsibilityId);
    console.log("Remarks:", Remarks);
    console.log("created_By:", created_By);

    // Insert the new user into the kra_trans table using a parameterized query
    const kraTransQuery = `
        INSERT INTO kra_trans (user_to_id, user_from_id, job_responsibility_id, remark, created_by, Creation_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
    const kraTransValues = [
      userToId,
      userFromId,
      jobResponsibilityId,
      Remarks,
      created_By,
      creation_date,
    ];
    const kraTransResult = await connection
      .promise()
      .query(kraTransQuery, kraTransValues);

    console.log("KRA added to kra_trans successfully");

    // Update the user_id in the user_job_responsi table
    const userJobResponsiQuery = `
        UPDATE user_job_responsi
        SET user_id = ?
        WHERE Job_res_id = ?
      `;
    const userJobResponsiValues = [userToId, Job_res_id];
    const userJobResponsiResult = await connection
      .promise()
      .query(userJobResponsiQuery, userJobResponsiValues);

    console.log("user_id updated in user_job_responsi successfully");

    res.status(200).send("KRA added and user_id updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding KRA to database");
  }
});

// target user_job_res data by user_id in  user_job _res
app.get("/jobrespon/:user_id", (req, res) => {
  const user_id = req.params.user_id; // Get the job_res_id from the URL parameter
  console.log(`Retrieving  Job_res_id for user_id: ${user_id}`);

  const query = `
      SELECT 
        ujr.*, 
        u2.user_name AS user_name,
        u2.user_email_id AS user_email_id,
        d.dept_name AS department_name,
        dm.desi_name AS designation_name
      FROM 
        user_job_responsi AS ujr
        LEFT JOIN user_mast AS u2 ON ujr.user_id = u2.user_id
        LEFT JOIN dept_mast AS d ON u2.dept_id = d.dept_id
        LEFT JOIN designation_mast AS dm ON u2.user_designation = dm.desi_id
      WHERE
        ujr.user_id  = ?;`;

  // Send the query to the MySQL database with the job_res_id parameter and handle any errors or data retrieved
  connection.query(query, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    // Process the data and add the image URLs to the response
    const userDataArray = results.map((user) => ({
      ...user,
      image_url: user.image ? userImagesBaseUrl + user.image : null,
      uid_url: user.UID ? userImagesBaseUrl + usr.UID : null,
      pan_url: user.pan ? userImagesBaseUrl + user.pan : null,
      highest_upload_url: user.highest_upload
        ? userImagesBaseUrl + user.highest_upload
        : null,
      other_upload_url: user.other_upload
        ? userImagesBaseUrl + user.other_upload
        : null,
    }));

    res.send(userDataArray); // Send the user data array back to the client
  });
});
//get all data of kra
app.get("/allkra", (req, res) => {
  console.log("Retrieving all kra information");

  const query = `
      SELECT kt.*,
             u1.user_name AS user_to_name,
             u2.user_name AS user_from_name
      FROM kra_trans AS kt
      LEFT JOIN user_mast AS u1 ON kt.user_to_id = u1.user_id
      LEFT JOIN user_mast AS u2 ON kt.user_from_id = u2.user_id
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
module.exports = app;
