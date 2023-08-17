const express = require("express");
const app = express.Router();

const connection = require("../db");
// 27/6/23 post user_job_responsibility data

app.post("/userjobrespo", async (req, res) => {
  console.log("post user_job_responsibility api hit");

  try {
    // Extract data from the request body
    const { user_id, job_responsi, description, created_by } = req.body;

    const jobResponsi = job_responsi || "";
    const userId = user_id || 0;

    // Check if remark is defined and convert to string
    const Description = description || "";
    const created_By = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query = `INSERT INTO user_job_responsi (user_id, sjob_responsibility, description, Creation_date, Created_by) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      userId, // Actual user_id value (e.g., 97)
      jobResponsi, // Actual job_responsi value (e.g., 'Lalit Gour')
      Description, // Actual description value (e.g., 'hello')
      creation_date, // Actual Creation_date value (e.g., '2023-07-21')
      created_By, // Actual Created_by value (e.g., 2)
    ];

    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("user_job_respo added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add user_job_respo to database");
  }
});
// get all data of user_job_respo
app.get("/alluserjobrespo", (req, res) => {
  console.log("Retrieving all user_job_responsibility information");

  // get user_res nby user_id
  app.get("/getuserjobrespo", (req, res) => {
    const userId = req.body.user_id;

    const query = `
        SELECT o.*, u.user_name
        FROM user_job_responsi AS o
        LEFT JOIN user_mast AS u ON o.user_id = u.user_id
        WHERE o.user_id = ?
      `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res
          .status(404)
          .json({ message: "No data found for the given user_id" });
        return;
      }

      const data = results; // Store the retrieved data in a variable

      res.status(200).json({ data: data }); // Send the data back to the client
    });
  });

  const query = `
      SELECT o.*, u.user_name
      FROM user_job_responsi  AS o
      LEFT JOIN user_mast AS u ON o.user_id = u.user_id
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
// update user_job_responsibilty data
app.put("/userjobrespoupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { user_id, job_responsi, description, Last_updated_by } = req.body;
  const id = req.body.id;

  // Update department record in the database
  connection.query(
    "UPDATE user_job_responsi  SET user_id  = ?, sjob_responsibility  = ?, description  = ?, Last_updated_date = ?, Last_updated_by = ? WHERE Job_res_id  = ?",
    [user_id, job_responsi, description, d1, Last_updated_by, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `Object with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Job_res_id  with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete user_job_respo data
app.delete("/userjobrespodelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM user_job_responsi  WHERE Job_res_id  = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `User with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `User with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// 21/7/23 post api of reispos_mast
app.post("/reponsi", async (req, res) => {
  console.log("post responsibility _mast api hit");

  try {
    // Extract data from the request body
    const { respo_name, description, remark, created_by } = req.body;

    // If dept_name is not defined or is empty, set it to an empty string
    const respoName = respo_name || "";

    // Check if remark is defined and convert to string
    const remarkValue = remark || "";
    const created_By = created_by || 0;
    const Description = description || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query =
      "INSERT INTO reponsi_mast   (respo_name,description , remark , created_at , created_by ) VALUES (?, ?, ?, ?,?)";
    const values = [
      respoName,
      Description,
      remarkValue,
      creation_date,
      created_By,
      // locationIdValue,
    ];
    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("responsibility added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add responsibility to database");
  }
});
// get all data of responsi_mast
app.get("/allresponsidata", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from reponsi_mast `, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// get data by id
app.get("/responsidata/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM reponsi_mast WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.length === 0) {
        // No data found for the given id
        res.sendStatus(404);
        return;
      }
      res.send(results[0]);
    }
  );
});
// delte responsi_mat data by id
app.delete("/respondelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM reponsi_mast   WHERE id = ?",
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
//update resipon_mast  data
app.put("/resipodataupdate/:id", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const { respo_name, description, remark, Last_updated_by } = req.body;
  const id = req.params.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    respo_name: respo_name || "",
    remark: remark || "",
    Description: description || "",
    last_updated_by: Last_updated_by || 0,
    last_updated_at: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE reponsi_mast  SET ? WHERE id = ?",
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
        const message = `resi record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `resi record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
//8/8/23 get user data by job_res_id
app.get("/userbyjobres/:job_responsibility", (req, res) => {
  const job_res_id = req.params.job_responsibility; // Get the job_res_id from the URL parameter
  console.log(`Retrieving user data for Job_res_id: ${job_res_id}`);

  const query = `
      SELECT 
        ujr.*, 
        u2.user_name AS user_name,
        d.dept_name AS department_name,
        dm.desi_name AS designation_name
      FROM 
        user_job_responsi AS ujr
        LEFT JOIN user_mast AS u2 ON ujr.user_id = u2.user_id
        LEFT JOIN dept_mast AS d ON u2.dept_id = d.dept_id
        LEFT JOIN designation_mast AS dm ON u2.user_designation = dm.desi_id
      WHERE
        ujr.sjob_responsibility  = ?;`;

  // Send the query to the MySQL database with the job_res_id parameter and handle any errors or data retrieved
  connection.query(query, [job_res_id], (err, results) => {
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
      uid_url: user.UID ? userImagesBaseUrl + user.UID : null,
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
module.exports = app;
