const express = require("express");
const app = express.Router();
const multer = require("multer");
// const nodemailer = require("nodemailer");
const path = require("path");
const connection = require("../db"); // Make sure to adjust the path as necessary necessary
// const multer = require("multer");
//get allusers
app.get("/allusers", (req, res) => {
  console.log(
    "Retrieving all users with location, department, and reporting information"
  );

  const query = `
  SELECT 
    u.*, 
    d.dept_name AS department_name, 
    rm.Role_name AS Role_name, 
    u2.user_name AS report,
    u3.user_name AS Report_L1N,
    u4.user_name AS Report_L2N,
    u5.user_name AS Report_L3N,
    dm.desi_name AS designation_name
  FROM 
    user_mast AS u
    LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
    LEFT JOIN designation_mast AS dm ON u.user_designation = dm.desi_id
    LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
    LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
    LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
    LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
    LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id;
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

// get user by id 6:02
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request parameter

    console.log(`Retrieving user with ID ${userId}`);

    const query = `
      SELECT u.*, d.dept_name AS department_name, rm.Role_name AS role_name, u2.user_name AS report
      , u3.user_name AS report_L1_name , u4.user_name AS report_L2_name, u5.user_name AS report_L3_name
      , dm.desi_name  AS designation_name FROM user_mast AS u
      LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id

      LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
      LEFT JOIN designation_mast  AS dm ON u.user_designation  = dm.desi_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
      LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
      LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
      WHERE u.user_id = ${userId};
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if user not found
        return;
      }

      const userData = results[0]; // Retrieve the first row (assuming user_id is unique)

      // Assuming the image URL is stored in the 'image_url' column of the user_mast table
      const imageUrl = userData.image;

      // Generate a downloadable URL for the image
      const downloadableUrl = imageUrl
        ? `${req.protocol}://${req.get("host")}/user_images/${imageUrl}`
        : null;

      // Add the downloadable URL to the user data
      userData.downloadableUrl = downloadableUrl;

      res.status(200).json(userData); // Send the user data as JSON response
    });
  } catch (error) {
    console.log(`Internal Server Error:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// check code 6:02
app.get("/usernew/:id", (req, res) => {
  const userId = req.params.id; // Get the user ID from the URL parameter
  console.log(`Retrieving user data for user ID: ${userId}`);

  const query = `
    SELECT 
      u.*, 
      d.dept_name AS department_name, 
      rm.Role_name AS Role_name, 
      u2.user_name AS report,
      u3.user_name AS Report_L1N_name,
      u4.user_name AS Report_L2N_name,
      u5.user_name AS Report_L3N,
      dm.desi_name AS designation_name
    FROM 
      user_mast AS u
      LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
      LEFT JOIN designation_mast AS dm ON u.user_designation = dm.desi_id
      LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
      LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
      LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
    WHERE
      u.user_id = ?;`;

  // Send the query to the MySQL database with the user ID parameter and handle any errors or data retrieved
  connection.query(query, [userId], (err, results) => {
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
    const user = results[0];
    const userImagesBaseUrl = "http://52.63.192.116:8000/user_images/";
    const userDataWithImageUrls = {
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
    };

    res.send({ data: userDataWithImageUrls }); // Send the user data back to the client
  });
});
const upload3 = multer({ dest: "user_images/" }).fields([
  { name: "image", maxCount: 1 },
  { name: "UID", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "highest_upload", maxCount: 1 },
  { name: "other_upload", maxCount: 1 },
]);
// Specify the destination folder for uploaded files
app.put("/userupdate", upload3, async (req, res) => {
  console.log("PUT /userupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const {
      user_name,
      user_designation,
      user_email_id,
      user_login_id,
      user_login_password,
      user_report_to_id,
      dept_id,
      user_contact_no,
      role_id,
      id,
      sitting_id,
      job_type,
      PersonalNumber,
      PersonalEmail,
      report_L1,
      report_L2,
      report_L3,
      joining_date,
      releaving_date,
      level,
      room_id,
      salary,
    } = req.body;

    console.log("product req.body", req.body);

    const updateObject = {
      user_name: user_name || "",
      user_designation: user_designation || "",
      user_email_id: user_email_id || "",
      user_login_id: user_login_id || "",
      user_login_password: user_login_password || "",
      user_contact_no: user_contact_no || "",
      job_type: job_type || "",
      PersonalNumber: PersonalNumber || "",
      PersonalEmail: PersonalEmail || "",
      level: level || "",
      joining_date: joining_date || "",
      releaving_date: releaving_date || "",
      Sitting_id: sitting_id || 0,
      Sitting_id: sitting_id || 0,
      Sitting_id: sitting_id || 0,
      user_report_to_id: user_report_to_id || 0,
      last_updated: currentDate,
      dept_id: dept_id || 0,
      report_L1: report_L1 || 0,
      report_L2: report_L2 || 0,
      report_L3: report_L3 || 0,
      joining_date: joining_date || null,
      releaving_date: releaving_date || null,
      salary: salary || 0,
      role_id: role_id || 0,
      room_id: room_id || 0,
      level: level || "",
      image: req.files.image ? req.files.image[0].filename : "",
      UID: req.files.UID ? req.files.UID[0].filename : "",
      pan: req.files.pan ? req.files.pan[0].filename : "",
      highest_upload: req.files.highest_upload
        ? req.files.highest_upload[0].filename
        : "",
      other_upload: req.files.other_upload
        ? req.files.other_upload[0].filename
        : "",
    };
    console.log("updateObject$$", updateObject);
    const getUserQuery = "SELECT * FROM user_mast WHERE user_id = ?";
    const [existingUser] = await connection.promise().query(getUserQuery, [id]);

    if (!existingUser || !existingUser.length) {
      return res.status(404).send("User not found");
    }

    const updateQuery =
      "UPDATE user_mast SET user_name = ?,user_designation = ?,user_email_id = ?,user_login_id = ?,user_login_password = ?,user_contact_no = ?,user_report_to_id = ?,last_updated = ?,dept_id = ?,role_id = ?,room_id=?,Sitting_id = ?,image = ?,job_type=?,PersonalNumber=?,Report_L1 =?,Report_L2=?,Report_L3=?,PersonalEmail =?,level =?,joining_date =?,releaving_date =?,UID=?,pan=?,highest_upload=?,other_upload=?,salary=? WHERE user_id = ?";

    const updateValues = [
      updateObject.user_name,
      updateObject.user_designation,
      updateObject.user_email_id,
      updateObject.user_login_id,
      updateObject.user_login_password,
      updateObject.user_contact_no,
      updateObject.user_report_to_id,
      updateObject.last_updated,
      updateObject.dept_id,
      updateObject.role_id,
      updateObject.room_id,
      updateObject.Sitting_id,
      updateObject.image, // Add the image field
      updateObject.job_type,
      updateObject.PersonalNumber,
      updateObject.report_L1,
      updateObject.report_L2,
      updateObject.report_L3,
      updateObject.PersonalEmail,
      updateObject.level,
      updateObject.joining_date,
      updateObject.releaving_date,
      updateObject.UID,
      updateObject.pan,
      updateObject.highest_upload,
      updateObject.other_upload,
      updateObject.salary,
      id,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("User updated successfully");
    res.status(200).send("User updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the user in the database: " + error.message);
  }
});
// 2/8/23 update only user image
const upload11 = multer({ dest: "user_images/" });

app.put("/userimageupdate", upload11.single("image"), async (req, res) => {
  console.log("PUT /userupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const { id } = req.body;

    const updateObject = {
      image: req.file ? req.file.filename : "",
    };
    console.log("updateObject$$", updateObject);
    const getUserQuery = "SELECT * FROM user_mast WHERE user_id = ?";
    const [existingUser] = await connection.promise().query(getUserQuery, [id]);

    if (!existingUser || !existingUser.length) {
      return res.status(404).send("User not found");
    }

    const updateQuery = "UPDATE user_mast SET ? WHERE user_id = ?";

    await connection.promise().query(updateQuery, [updateObject, id]);

    console.log("User image updated successfully");
    res.status(200).send("User image updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the user image in the database: " + error.message);
  }
});

// delete user
app.delete("/userdelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM user_mast WHERE user_id = ?",
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
// 22/6/23 code in json
app.post("/usersdata", (req, res) => {
  const id = req.body.role_id;
  const user_id = req.body.user_id;

  console.log("user_id === ", user_id);
  console.log("role_id === ", id);

  const query = `SELECT user_id, role_id, user_name, image FROM user_mast WHERE user_id != ? AND role_id = ?;`;

  connection.query(query, [user_id, id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const userData = results.map((result) => ({
      user_id: result.user_id,
      role_id: result.role_id,
      user_name: result.user_name,
      user_image_url: `${req.protocol}://${req.get("host")}/user_images/${
        result.image
      }`, // Update the image URL
    }));

    res.status(200).json(userData); // Send the user data in JSON format
  });
});
app.use("/user_images", express.static(path.join(__dirname, "user_images")));
//userdata with image in json formate
app.get("/userdata", async (req, res) => {
  try {
    // Retrieve users from the database
    const query = "SELECT * FROM user_mast";
    const [users] = await connection.promise().query(query);

    // Map the user data to a JSON array
    const userData = users.map((user) => ({
      user_id: user.user_id,
      user_name: user.user_name,
      user_designation: user.user_designation,
      image: user.image
        ? `${req.protocol}://${req.get("host")}/user_images/${user.image}`
        : null,
    }));

    // Send the user data as JSON
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error retrieving users from the database:", error);
    res.status(500).json({ error: "Error retrieving users from the database" });
  }
});
// get login user data in json formate
app.post("/loginuserdata", async (req, res) => {
  const id = req.body.id;
  try {
    // Retrieve user from the database based on the provided user ID
    const query = "SELECT * FROM user_mast WHERE user_id = ?";
    const [users] = await connection.promise().query(query, [id]);

    // Create an array to hold the user objects
    const userData = [];
    users.forEach((user) => {
      const userObject = {
        user_id: user.user_id,
        user_name: user.user_name,
        user_designation: user.user_designation,
      };
      if (user.image) {
        userObject.image = `${req.protocol}://${req.get("host")}/user_images/${
          user.image
        }`;
      } else {
        userObject.image = null;
      }
      userData.push(userObject);
    });

    // Send the user data in JSON format
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error retrieving user from the database:", error);
    res.status(500).send("Error retrieving user from the database");
  }
});
const secretKey = "hi";
app.post("/login", async (req, res) => {
  console.log("login api hit");
  const { user_login_id, user_login_password } = req.body;

  // check if email and password are provided
  if (!user_login_id || !user_login_password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // check if user with given email exists in the database and retrieve the corresponding Sitting_id and Sitting_ref_no
    const [rows] = await connection.promise().query(
      `
        SELECT 
          user_mast.*,
          Sitting_mast.Sitting_id,
          Sitting_mast.Sitting_ref_no
        FROM 
          user_mast 
          INNER JOIN Sitting_mast ON user_mast.sitting_id = Sitting_mast.Sitting_id
        WHERE 
          user_login_id = ? 
          AND user_login_password=?
        `,
      [user_login_id, user_login_password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // generate JWT token
    const token = jwt.sign(
      {
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email_id,
        sitting_id: rows[0].sitting_id,
        role_id: rows[0].role_id,
        dept_id: rows[0].dept_id,
        room_id: rows[0].room_id,
        // Add the following two lines to include Sitting_id and Sitting_ref_no in the token
        Sitting_id: rows[0].Sitting_id,
        Sitting_ref_no: rows[0].Sitting_ref_no,
        onboard_status: rows[0].onboard_status,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    // send token and user data in response
    return res.json({
      token,
      user: {
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email_id,
        dept_id: rows[0].dept_id,
        role_id: rows[0].role_id,
        sitting_id: rows[0].sitting_id,
        room_id: rows[0].room_id,
        // Add the following two lines to include Sitting_id and Sitting_ref_no in the response
        Sitting_id: rows[0].Sitting_id,
        Sitting_ref_no: rows[0].Sitting_ref_no,
        onboard_status: rows[0].onboard_status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// 10/6/23 get delivery boy onlyby sitting
app.post("/deliveryboy", (req, res) => {
  const id = 3;
  const room_id = req.body.room_id;

  console.log("room_id === ", room_id);
  console.log("role_id === ", id);

  const query = `SELECT user_id FROM user_mast WHERE  role_id = 3;`;
  console.log("query====", query);
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }
    console.log("results", results);
    res.send({ results }); // Send the data back to the client
  });
});
app.post("/userpresitting", async (req, res) => {
  console.log("POST /userpresitting API hit");
  try {
    const User_id = req.body.user_id;
    console.log("User_id##", User_id);

    // Retrieve the last 5 distinct Sitting_id values for the specified User_id from Order_req_mast
    const query = `
      SELECT DISTINCT
        Order_req_mast.Sitting_id
      FROM
        Order_req_mast
      WHERE
        Order_req_mast.User_id = ?
      ORDER BY
        Order_req_mast.Sitting_id DESC
      LIMIT 5;
    `;

    const [sittingIds] = await connection.promise().query(query, [User_id]);

    if (!sittingIds || sittingIds.length === 0) {
      return res.status(404).json({ message: "No order requests found" });
    }

    // Extract the Sitting_id values from the result set
    const sittingIdValues = sittingIds.map((row) => row.Sitting_id);

    // Retrieve corresponding Sitting_mast data for the last 5 Sitting_id values
    const sitingMastQuery = `
      SELECT
        Sitting_mast.*
      FROM
        Sitting_mast
      WHERE
        Sitting_mast.Sitting_id IN (${sittingIdValues.join(",")});
    `;

    const [sittingMastData] = await connection.promise().query(sitingMastQuery);

    console.log("Sitting_mast Data##", sittingMastData);

    res.status(200).json(sittingMastData);
  } catch (error) {
    console.error("Error retrieving order requests from the database:", error);
    res
      .status(500)
      .json({ message: "Error retrieving order requests from the database" });
  }
});
app.get("/deliveryuser", async (req, res) => {
  try {
    const query = `
      SELECT u.*, d.dept_name AS department_name, rm.Role_name AS role_name, u2.user_name AS report
      FROM user_mast AS u
      LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
      LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      WHERE u.role_id = 3;
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if users not found
        return;
      }

      const usersData = results.map((user) => {
        // Assuming the image URL is stored in the 'image_url' column of the user_mast table
        const imageUrl = user.image;

        // Generate a downloadable URL for the image
        const downloadableUrl = imageUrl
          ? `${req.protocol}://${req.get("host")}/user_images/${imageUrl}`
          : null;

        // Create the user data object with the downloadable URL
        return {
          ...user,
          downloadableUrl: downloadableUrl,
        };
      });

      res.status(200).json(usersData); // Send the users data as JSON response
    });
  } catch (error) {
    console.log(`Internal Server Error:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// 28/6/23 post data in user_auth_detail
app.post("/userauthdetail", async (req, res) => {
  console.log("post user_auth_detail API hit");

  try {
    // Extract data from the request body
    const {
      Juser_id,
      obj_id,
      insert_flag,
      view_flag,
      update_flag,
      delete_flag,
      created_by,
    } = req.body;

    // Convert values to integers
    const JuserId = parseInt(Juser_id) || 0;
    const objId = parseInt(obj_id) || 0;
    const insertFlag = parseInt(insert_flag) || 0;
    const viewFlag = parseInt(view_flag) || 0;
    const updateFlag = parseInt(update_flag) || 0;
    const deleteFlag = parseInt(delete_flag) || 0;
    const createdBy = parseInt(created_by) || 0;

    // Get the current date
    const currentDate = new Date();
    const creationDate = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Insert the new user_auth_detail into the database using a parameterized query
    const query =
      "INSERT INTO user_auth_detail (Juser_id, obj_id, `insert`, `view`, `update`, delete_flag, creation_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      JuserId,
      objId,
      insertFlag,
      viewFlag,
      updateFlag,
      deleteFlag,
      creationDate,
      createdBy,
    ];

    const result = await connection.promise().query(query, values);

    console.log("user_auth_detail added successfully");
    res.status(200).send("user_auth_detail added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add user_auth_detail to the database");
  }
});
// get all data of user_auth_detail
app.get("/alluserauthdetail", (req, res) => {
  console.log("Retrieving all user_auth_detail information");

  const query = `
    SELECT o.*, u.user_name, ob.obj_name 
    FROM user_auth_detail  AS o
    LEFT JOIN user_mast AS u ON o.Juser_id  = u.user_id
    LEFT JOIN object_mast AS ob ON ob.obj_id = o.obj_id 
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
// update user_auth_detail data
app.put("/userauthdetailupdate", (req, res) => {
  console.log("uauth update hitted");
  var d1 = new Date();

  // Extract data from the request body
  const {
    Juser_id,
    obj_id,
    insert,
    view,
    update,
    delete_flag,
    Last_updated_by,
  } = req.body;
  const id = req.body.id;
  console.log("req.body##", req.body);
  // Update user_auth_detail record in the database
  connection.query(
    "UPDATE user_auth_detail SET Juser_id = ?, obj_id = ?, `insert_value` = ?, `view_value` = ?, `update_value` = ?, delete_flag_value = ?, Last_updated_date = ?, Last_updated_by = ? WHERE auth_id = ?",
    [
      Juser_id,
      obj_id,
      insert,
      view,
      update,
      delete_flag,
      d1,
      Last_updated_by,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `user_auth_detail with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `user_auth_detail with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete user_auth_detail data
app.delete("/userauthdetaildelete", (req, res) => {
  // console.log("delete api hit");
  const id = req.body.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM user_auth_detail   WHERE auth_id  = ?",
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
app.get("/userauth/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request body

    console.log(`Retrieving user with ID ${userId}`);

    const query = `
      SELECT uad.*, d.dept_name AS department_name, u2.user_name AS user_Name, om.obj_name AS obj_Name
      FROM user_auth_detail AS uad
      LEFT JOIN object_mast AS om ON om.obj_id = uad.obj_id 
      LEFT JOIN dept_mast AS d ON om.dept_id = d.dept_id
      LEFT JOIN user_mast AS u2 ON uad.Juser_id = u2.user_id
      WHERE uad.Juser_id = ?;
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if user not found
        return;
      }

      const userData = results; // Assign the entire results array to userData

      // Assuming the image URL is stored in the 'image_url' column of the user_mast table
      const imageUrl = userData[0].image; // Use the first row's image URL for generating downloadable URL

      // Generate a downloadable URL for the image
      const downloadableUrl = imageUrl
        ? `${req.protocol}://${req.get("host")}/user_images/${imageUrl}`
        : null;

      // Add the downloadable URL to each row of user data
      userData.forEach((row) => {
        row.downloadableUrl = downloadableUrl;
      });

      res.status(200).json(userData); // Send the user data as JSON response
    });
  } catch (error) {
    console.log(`Internal Server Error:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 29/6/23 menu  level api;
app.get("/userobjectauth", async (req, res) => {
  try {
    const userId = req.body.user_id;
    const objId = req.body.obj_id; // Get the user ID from the request parameter

    console.log(`Ret/rieving user with ID ${userId}`);
    console.log(`Ret/rieving obj with ID ${objId}`);

    const query = `
      SELECT uad.*, d.dept_name AS department_name, u2.user_name AS user_Name, om.obj_name AS obj_Name
      FROM user_auth_detail AS uad
      LEFT JOIN object_mast AS om ON om.obj_id = uad.obj_id 
      LEFT JOIN dept_mast AS d ON om.dept_id = d.dept_id
      LEFT JOIN user_mast AS u2 ON uad.Juser_id = u2.user_id
      WHERE uad.Juser_id = ${userId} AND  uad.obj_id = ${objId};
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if user not found
        return;
      }

      const userData = results[0]; // Retrieve the first row (assuming user_id is unique)

      // Assuming the image URL is stored in the 'image_url' column of the user_mast table
      const imageUrl = userData.image;

      // Generate a downloadable URL for the image
      const downloadableUrl = imageUrl
        ? `${req.protocol}://${req.get("host")}/user_images/${imageUrl}`
        : null;

      // Add the downloadable URL to the user data
      userData.downloadableUrl = downloadableUrl;

      res.status(200).json(userData); // Send the user data as JSON response
    });
  } catch (error) {
    console.log(`Internal Server Error:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// 6/7/23 user insert with trigger
const upload2 = multer({ dest: "user_images/" }).fields([
  { name: "image", maxCount: 1 },
  { name: "UID", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "highest_upload", maxCount: 1 },
  { name: "other_upload", maxCount: 1 },
]);

app.post("/users", upload2, async (req, res) => {
  console.log("post user API hit");
  try {
    // Extract data from the request body

    const {
      user_name,
      user_designation,
      user_email_id,
      user_login_id,
      user_login_password,
      user_report_to_id,
      user_contact_no,
      dept_id,
      location_id,
      created_by,
      role_id,
      sitting_id,
      job_type,
      personal_number,
      report_L1,
      report_L2,
      report_L3,
      Personal_email,
      joining_date,
      releaving_date,
      level,
      room_id,
      salary,
    } = req.body;

    const userDesignation = user_designation || "";
    const jobType = job_type || "";
    const personalNumber = personal_number || "";
    const PersonalEmail = Personal_email || "";
    const reportL1 = report_L1 ? parseInt(report_L1) : 0;
    const reportL2 = report_L2 ? parseInt(report_L2) : 0;
    const reportL3 = report_L3 ? parseInt(report_L3) : 0;
    const roomId = room_id ? parseInt(room_id) : 0;
    const userReportToId = user_report_to_id ? parseInt(user_report_to_id) : 0;
    const departmentId = dept_id ? parseInt(dept_id) : 0;
    const roleId = role_id ? parseInt(role_id) : 0;
    const sittingId = sitting_id ? parseInt(sitting_id) : 0;
    const image = req.files.image ? req.files.image[0].filename : null;
    const createdAt = new Date();
    const joingDate = joining_date || null;
    const releavingDate = releaving_date || null;
    const Level = level || "";
    const UID = req.files.UID ? req.files.UID[0].filename : null;
    const pan = req.files.pan ? req.files.pan[0].filename : null;
    const highest_upload = req.files.highest_upload
      ? req.files.highest_upload[0].filename
      : null;
    const other_upload = req.files.other_upload
      ? req.files.other_upload[0].filename
      : null;
    const salaryc = salary ? parseInt(salary) : 0;

    // Insert the new user into the user_mast table
    const insertUserQuery = `
      INSERT INTO user_mast (
        user_name,
        user_designation,
        user_email_id,
        user_login_id,
        user_login_password,
        user_report_to_id,
        user_contact_no,
        dept_id,
        location_id,
        created_by,
        role_id,
        sitting_id,
        created_at,
        job_type,
        PersonalNumber,
        Report_L1,
        Report_L2,
        Report_L3,
        PersonalEmail ,
        joining_date ,
        releaving_date ,
        level ,
        room_id,
        image,
        UID,
        pan,
        highest_upload,
        other_upload,
        salary
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const userValues = [
      user_name || "",
      userDesignation,
      user_email_id || "",
      user_login_id || "",
      user_login_password || "",
      userReportToId,
      user_contact_no || "",
      departmentId,
      location_id || 0,
      created_by || 0,
      roleId || 0,
      sittingId || 0,
      createdAt,
      jobType || "",
      personalNumber || "",
      reportL1 || 0,
      reportL2 || 0,
      reportL3 || 0,
      PersonalEmail || "",
      joingDate || null,
      releavingDate || null,
      Level || "",
      roomId || 0,
      image,
      UID,
      pan,
      highest_upload,
      other_upload,
      salaryc || 0,
    ];

    // Execute the insert query for the user
    const userResult = await connection
      .promise()
      .query(insertUserQuery, userValues);
    const userId = userResult[0].insertId;

    // Get all objects from the object_mast table
    const objectQuery = `SELECT * FROM object_mast`;

    const objectResult = await connection.promise().query(objectQuery);
    const objects = objectResult[0];

    // Insert user_auth_detail for each object
    const insertUserAuthQuery = `
      INSERT INTO user_auth_detail (
        Juser_id,
        obj_id,
        insert_value,
        view_value,
        update_value,
        delete_flag_value,
        creation_date,
        created_by,
        last_updated_by,
        last_updated_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      insert_value = VALUES(insert_value),
      view_value = VALUES(view_value),
      update_value = VALUES(update_value),
      delete_flag_value = VALUES(delete_flag_value)
    `;

    for (const object of objects) {
      const objectId = object.obj_id;
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
        createdAt,
        created_by || 0,
        created_by || 0,
        createdAt,
      ];

      // Execute the insert query for user_auth_detail for each object
      await connection.promise().query(insertUserAuthQuery, userAuthValues);
    }

    console.log("User and user_auth_detail added successfully");
    res.status(200).send("User and user_auth_detail added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user to database: " + error.message);
  }
});
const nodemailer = require("nodemailer");

// const app = express();
const upload5 = multer({ dest: "uploads/" });
const ejs = require("ejs");
const fs = require("fs");

// check code 8/7/23 12:38
app.post("/mail2", upload5.single("attachment"), async (req, res) => {
  console.log("mail api hit");
  try {
    const { email, subject, name, password, login_id, status } = req.body;
    const attachment = req.file;
    if (status == "onboarded") {
      // Read the email template file
      const templatePath = path.join(__dirname, "template.ejs");
      const template = await fs.promises.readFile(templatePath, "utf-8");

      // Render the email template with dynamic values
      const html = ejs.render(template, { email, password, name, login_id });

      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shefalisethiya349@gmail.com", // enter your email
          pass: "lkpwsgsdnmhhmwiw", // enter associated password of that id
        },
      });

      let mailOptions = {
        from: "shefalisethiya349@gmail.com",
        to: email,
        subject: subject,
        html: html,
        attachments: attachment
          ? [
              {
                filename: attachment.originalname,
                path: attachment.path,
              },
            ]
          : [],
      };

      await mailTransporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.sendStatus(200);
    } else {
      const templatePath = path.join(__dirname, "template.ejs");
      const template = await fs.promises.readFile(templatePath, "utf-8");

      // Render the email template with dynamic values
      const html = ejs.render(template, { email, password, name, login_id });

      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shefalisethiya349@gmail.com", // enter your email
          pass: "lkpwsgsdnmhhmwiw", // enter associated password of that id
        },
      });

      let mailOptions = {
        from: "shefalisethiya349@gmail.com",
        to: email,
        subject: subject,
        html: html,
        attachments: attachment
          ? [
              {
                filename: attachment.originalname,
                path: attachment.path,
              },
            ]
          : [],
      };

      await mailTransporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error Occurs", error);
    res.sendStatus(500);
  }
});
// dept wise user list
app.get("/usersbydeptid/:dept_id", async (req, res) => {
  try {
    const deptId = req.params.dept_id; // Get the department ID from the request parameter

    console.log(`Retrieving users of department with ID ${deptId}`);

    const query = `
      SELECT u.*, d.dept_name AS department_name, rm.Role_name AS role_name, u2.user_name AS report
      , u3.user_name AS report_L1_name , u4.user_name AS report_L2_name, u5.user_name AS report_L3_name
      , dm.desi_name  AS designation_name FROM user_mast AS u
      LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
       
      LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
      LEFT JOIN designation_mast  AS dm ON u.user_designation  = dm.desi_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
      LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
      LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
      WHERE u.dept_id = ?;
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, [deptId], (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if no users found for the department
        return;
      }

      // Process each user data to generate downloadable URLs for images
      const userData = results.map((user) => {
        const imageUrl = user.image;

        // Generate a downloadable URL for the image
        const downloadableUrl = imageUrl
          ? `${req.protocol}://${req.get("host")}/user_images/${imageUrl}`
          : null;

        // Add the downloadable URL to the user data
        return { ...user, downloadableUrl };
      });

      res.status(200).json(userData); // Send the user data as JSON response
    });
  } catch (error) {
    console.log(`Internal Server Error:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// get user_res nby user_id
app.post("/getuserjobrespo", (req, res) => {
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
      res.status(404).json({ message: "No data found for the given user_id" });
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.status(200).json({ data: data }); // Send the data back to the client
  });
});
//1/8/23 post user new endpoint with addon new fields
const upload9 = multer({ dest: "user_images/" }).fields([
  { name: "image", maxCount: 1 },
  { name: "UID", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "highest_upload", maxCount: 1 },
  { name: "other_upload", maxCount: 1 },
]);

app.post("/userspostnew", upload9, async (req, res) => {
  console.log("post userpostnew API hit");
  try {
    // Extract data from the request body

    const {
      user_name,
      user_designation,
      user_email_id,
      user_login_id,
      user_login_password,
      user_report_to_id,
      user_contact_no,
      dept_id,
      location_id,
      created_by,
      role_id,
      sitting_id,
      job_type,
      personal_number,
      report_L1,
      report_L2,
      report_L3,
      Personal_email,
      joining_date,
      releaving_date,
      level,
      room_id,
      salary,
      SpokenLanguages,
      Gender,
      Nationality,
      DOB,
      Age,
      FatherName,
      MotherName,
      Hobbies,
      BloodGroup,
      MartialStatus,
      DateofMarriage,
      tds_applicable,
      tds_per,
      onboard_status,
      image_remark,
      image_validate,
      uid_remark,
      uid_validate,
      pan_remark,
      pan_validate,
      highest_upload_remark,
      highest_upload_validate,
      other_upload_remark,
      other_upload_validate,
    } = req.body;

    const userDesignation = user_designation || "";
    const jobType = job_type || "";
    const personalNumber = personal_number || "";
    const PersonalEmail = Personal_email || "";
    const reportL1 = report_L1 ? parseInt(report_L1) : 0;
    const reportL2 = report_L2 ? parseInt(report_L2) : 0;
    const reportL3 = report_L3 ? parseInt(report_L3) : 0;
    const roomId = room_id ? parseInt(room_id) : 0;
    const userReportToId = user_report_to_id ? parseInt(user_report_to_id) : 0;
    const departmentId = dept_id ? parseInt(dept_id) : 0;
    const roleId = role_id ? parseInt(role_id) : 0;
    const sittingId = sitting_id ? parseInt(sitting_id) : 0;
    const image = req.files.image ? req.files.image[0].filename : null;
    const createdAt = new Date();
    const joingDate = joining_date || null;
    const releavingDate = releaving_date || null;
    const Level = level || "";
    const UID = req.files.UID ? req.files.UID[0].filename : null;
    const pan = req.files.pan ? req.files.pan[0].filename : null;
    const highest_upload = req.files.highest_upload
      ? req.files.highest_upload[0].filename
      : null;
    const other_upload = req.files.other_upload
      ? req.files.other_upload[0].filename
      : null;
    const salaryc = salary ? parseInt(salary) : 0;
    const Spokenlanguages = SpokenLanguages || "";
    const Status = onboard_status || 3;
    const gender = Gender || "";
    const nationality = Nationality || "";
    const age = Age || "";
    const Fathername = FatherName || "";
    const Mothername = MotherName || "";
    const hobbies = Hobbies || "";
    const Bloodgroup = BloodGroup || "";
    const Martialstatus = MartialStatus || "";
    const DateOfMarriage = DateofMarriage || "";
    const dob = DOB || "";
    const tdsApplicable = tds_applicable || "";
    const tdsPer = tds_per || 0;
    const imageRemark = image_remark || "";
    const imageValidate = image_validate || "";
    const uidRemark = uid_remark || "";
    const uidValidate = uid_validate || "";
    const panRemark = pan_remark || "";
    const panValidate = pan_validate || "";
    const highestUploadRemark = highest_upload_remark || "";
    const highestUploadValidate = highest_upload_validate || "";
    const otherUploadRremark = other_upload_remark || "";
    const otherUploadValidate = other_upload_validate || "";

    // Insert the new user into the user_mast table
    // ...
    const insertUserQuery = `
  INSERT INTO user_mast (
    user_name,
    user_designation,
    user_email_id,
    user_login_id,
    user_login_password,
    user_report_to_id,
    user_contact_no,
    dept_id,
    location_id,
    created_by,
    role_id,
    sitting_id,
    created_at,
    job_type,
    PersonalNumber,
    Report_L1,
    Report_L2,
    Report_L3,
    PersonalEmail,
    joining_date,
    releaving_date,
    level,
    room_id,
    image,
    UID,
    pan,
    highest_upload,
    other_upload,
    salary,
    onboard_status,
    SpokenLanguages,
    Gender,
    Nationality,
    DOB,
    Age,
    fatherName,
    motherName,
    BloodGroup,
    MartialStatus,
    DateOfMarriage,
    tbs_applicable,
    tds_per,
    image_remark,
    uid_validate,
    pan_remark,
    pan_validate,
    highest_upload_remark,
    highest_upload_validate,
    other_upload_remark,
    other_upload_validate
  )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

    const userValues = [
      user_name || "",
      userDesignation,
      user_email_id || "",
      user_login_id || "",
      user_login_password || "",
      userReportToId,
      user_contact_no || "",
      departmentId,
      location_id || 0,
      created_by || 0,
      roleId || 0,
      sittingId || 0,
      createdAt,
      jobType || "",
      personalNumber || "",
      reportL1 || 0,
      reportL2 || 0,
      reportL3 || 0,
      PersonalEmail || "",
      joingDate || null,
      releavingDate || null,
      Level || "",
      roomId || 0,
      image,
      UID,
      pan,
      highest_upload,
      other_upload,
      salaryc || 0,
      Status || "",
      Spokenlanguages || "",
      gender || "",
      nationality || "",
      dob || "",
      age || "",
      Fathername || "",
      Mothername || "",
      Bloodgroup || "",
      Martialstatus || "",
      DateOfMarriage || "",
      tdsApplicable || "",
      tdsPer || 0,
      imageRemark || "",
      imageValidate || "",
      uidRemark || "",
      uidValidate || "",
      panRemark || "",
      panValidate || "",
      highestUploadRemark || "",
      highestUploadValidate || "",
      otherUploadRremark || "",
      otherUploadValidate || "",
    ];

    // Execute the insert query for the user
    const userResult = await connection
      .promise()
      .query(insertUserQuery, userValues);
    const userId = userResult[0].insertId;

    // Get all objects from the object_mast table
    const objectQuery = `SELECT * FROM object_mast`;

    const objectResult = await connection.promise().query(objectQuery);
    const objects = objectResult[0];

    // Insert user_auth_detail for each object
    const insertUserAuthQuery = `
      INSERT INTO user_auth_detail (
        Juser_id,
        obj_id,
        insert_value,
        view_value,
        update_value,
        delete_flag_value,
        creation_date,
        created_by,
        last_updated_by,
        last_updated_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      insert_value = VALUES(insert_value),
      view_value = VALUES(view_value),
      update_value = VALUES(update_value),
      delete_flag_value = VALUES(delete_flag_value)
    `;

    for (const object of objects) {
      const objectId = object.obj_id;
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
        createdAt,
        created_by || 0,
        created_by || 0,
        createdAt,
      ];

      // Execute the insert query for user_auth_detail for each object
      await connection.promise().query(insertUserAuthQuery, userAuthValues);
    }

    console.log("User and user_auth_detail added successfully");
    res.status(200).send("User and user_auth_detail added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding user to database: " + error.message);
  }
});
app.get("/getuserdeptwisewfhdata/:id", (req, res) => {
  const dept_id = req.params.id; // Get the lead_mast ID from the request parameters

  connection.query(
    "SELECT * FROM user_mast  WHERE dept_id  = ? AND job_type='wfh'",
    [dept_id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      if (results.length === 0) {
        // If no record found with the given ID, send a 404 response
        res.status(404).json({ message: "Lead data not found" });
      } else {
        // If data found, send it in the response as an array of objects
        res.json(results);
      }
    }
  );
});
// 4/8/23 get api of users with all addon fieldsand files downloadable url
app.get("/allusersnew", (req, res) => {
  console.log(
    "##Retrieving all users with location, department, and reporting information"
  );

  const query = `
    SELECT 
    u.*, 
    d.dept_name AS department_name, 
    rm.Role_name AS Role_name, 
    u2.user_name AS report,
    u3.user_name AS Report_L1N,
    u4.user_name AS Report_L2N,
    u5.user_name AS Report_L3N,
    dm.desi_name AS designation_name
  FROM 
    user_mast AS u
    LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
    LEFT JOIN designation_mast AS dm ON u.user_designation = dm.desi_id
    LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
    LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
    LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
    LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
    LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
  `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }
    const userImagesBaseUrl = "http://3.88.87.80:8000/user_images/";
    // Process the data and add the image URLs to the response
    const dataWithImageUrls = results.map((user) => ({
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

    res.send({ data: dataWithImageUrls }); // Send the updated data back to the client
  });
});
// 7/8/23 get user by id
app.get("/usernew/:userId", (req, res) => {
  const userId = req.params.userId; // Get the user ID from the URL parameter
  console.log(`Retrieving user data for user ID: ${userId}`);

  const query = `
    SELECT 
      u.*, 
      d.dept_name AS department_name, 
      rm.Role_name AS Role_name, 
      u2.user_name AS report,
      u3.user_name AS Report_L1N,
      u4.user_name AS Report_L2N,
      u5.user_name AS Report_L3N,
      dm.desi_name AS designation_name
    FROM 
      user_mast AS u
      LEFT JOIN dept_mast AS d ON u.dept_id = d.dept_id
      LEFT JOIN designation_mast AS dm ON u.user_designation = dm.desi_id
      LEFT JOIN Role_mast AS rm ON u.role_id = rm.Role_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
      LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
      LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
    WHERE
      u.user_id = ?;`;

  // Send the query to the MySQL database with the user ID parameter and handle any errors or data retrieved
  connection.query(query, [userId], (err, results) => {
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
    const user = results[0];
    const userDataWithImageUrls = {
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
    };

    res.send(userDataWithImageUrls); // Send the user data back to the client
  });
});
app.put("/userupdatenew", upload3, async (req, res) => {
  console.log("PUT /userupdatenew API hit");
  const currentDate = new Date();

  try {
    const { id, ...updateFields } = req.body; // Extract user ID and other update fields

    console.log("user req.body", req.body);

    const getUserQuery = "SELECT * FROM user_mast WHERE user_id = ?";
    const [existingUser] = await connection.promise().query(getUserQuery, [id]);

    if (!existingUser || !existingUser.length) {
      return res.status(404).send("User not found");
    }

    // Construct the update query dynamically
    const updateQuery = "UPDATE user_mast SET ? WHERE user_id = ?";

    // Construct the update object dynamically with non-null fields
    const updateObject = {};
    for (const field in updateFields) {
      if (updateFields[field] !== null && updateFields[field] !== undefined) {
        updateObject[field] = updateFields[field];
      }
    }

    // If images are provided, update the image fields
    if (req.files.image) {
      updateObject.image = req.files.image[0].filename;
    }
    if (req.files.UID) {
      updateObject.UID = req.files.UID[0].filename;
    }
    if (req.files.pan) {
      updateObject.pan = req.files.pan[0].filename;
    }
    if (req.files.highest_upload) {
      updateObject.highest_upload = req.files.highest_upload[0].filename;
    }
    if (req.files.other_upload) {
      updateObject.other_upload = req.files.other_upload[0].filename;
    }

    // Add last_updated field
    updateObject.last_updated = currentDate;

    // Execute the update query with the updateObject and user_id
    await connection.promise().query(updateQuery, [updateObject, id]);

    console.log("User updated successfully");
    res.status(200).send("User updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the user in the database: " + error.message);
  }
});
// get user by status of dept wise user 4/8/23 5:12
app.get("/allusertdatabysdept", (req, res) => {
  // Get the onboard_status and dept_id from the request query parameters
  const onboardStatus = req.body.onboard_status;
  const deptId = req.body.dept_id;

  // Construct the SQL query with conditional filtering based on onboard_status and dept_id
  const query = `
    SELECT
      um.*,
      dm.dept_name
    FROM
      user_mast AS um
      LEFT JOIN dept_mast AS dm ON um.dept_id = dm.dept_id
    WHERE
      um.onboard_status = ? AND
      um.dept_id = ?
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
// 9/8/23 get deptwise l1,l2,l3 users
app.post("/l1l2l3usersbydept", (req, res) => {
  const { dept_id } = req.body; // Get the dept_id from the request body
  console.log(`Retrieving users for dept_id: ${dept_id}`);

  const query = `
    SELECT
      u.*,
      u2.user_name AS report,


      
      u3.user_name AS Report_L1N,
      u4.user_name AS Report_L2N,
      u5.user_name AS Report_L3N,
      dm.dept_name AS dept_name,
      dsm.desi_name AS desi_name
    FROM
      user_mast AS u
      LEFT JOIN designation_mast AS dsm ON u.user_designation = dsm.desi_id
      LEFT JOIN dept_mast AS dm ON u.dept_id = dm.dept_id
      LEFT JOIN user_mast AS u2 ON u.user_report_to_id = u2.user_id
      LEFT JOIN user_mast AS u3 ON u.Report_L1 = u3.user_id
      LEFT JOIN user_mast AS u4 ON u.Report_L2 = u4.user_id
      LEFT JOIN user_mast AS u5 ON u.Report_L3 = u5.user_id
    WHERE u.dept_id = ?;`;

  // Send the query to the MySQL database with the dept_id parameter and handle any errors or data retrieved
  connection.query(query, [dept_id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    // Process the data and add the image URLs to the response
    const dataWithImageUrls = results.map((user) => ({
      ...user,
      image_url: user.image
        ? "http://52.63.192.116:8000/user_images/" + user.image
        : null,
    }));

    res.send({ data: dataWithImageUrls }); // Send the data back to the client
  });
});
app.get("/getuserdeptwise/:id", (req, res) => {
  const dept_id = req.params.id; // Get the lead_mast ID from the request parameters

  connection.query(
    "SELECT * FROM user_mast  WHERE dept_id  = ? ",
    [dept_id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      if (results.length === 0) {
        // If no record found with the given ID, send a 404 response
        res.status(404).json({ message: "Lead data not found" });
      } else {
        // If data found, send it in the response as an array of objects
        res.json(results);
      }
    }
  );
});
//16/8/23 user_other_fields mast post
// const multer = require("multer");
const upload10 = multer({ dest: "user_images/" });

app.post(
  "/userotherfieldpostnew",
  upload10.single("field_value"),
  async (req, res) => {
    console.log("post userotherfieldpost API hit");
    try {
      // Extract data from the request body
      const { user_id, field_name, created_by, remark } = req.body;

      const UserId = user_id || 0;
      const fieldName = field_name || "";
      const createdBy = created_by || 0;
      const fieldValue = req.file ? req.file.filename : ""; // Use req.file.filename to get the uploaded file name
      const createdAt = new Date();
      const Remark = remark || "";
      console.log("fieldValue", fieldValue);
      // Insert the new user field into the user_other_field_mast table
      const insertFieldQuery = `
      INSERT INTO user_other_field_mast (
        user_id,
        field_name,
        field_value,
        created_at,
        created_by,
        remark
      )
      VALUES (?,?,?,?,?,?)
    `;

      const fieldValues = [
        UserId || 0,
        fieldName,
        fieldValue,
        createdAt,
        createdBy,
        Remark,
      ];

      // Execute the insert query for the user field
      await connection.promise().query(insertFieldQuery, fieldValues);

      console.log("User other field added successfully");
      res.status(200).send("User other field added successfully");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("Error adding user other field to database: " + error.message);
    }
  }
);
app.get("/allusersotherfielddata", (req, res) => {
  console.log("Retrieving all users with other field data");

  const query = `
    SELECT 
      u.*,
      u4.user_name AS user_name,
      u5.user_name AS created_by_name
    FROM 
      user_other_field_mast AS u
    LEFT JOIN user_mast AS u4 ON u.user_id = u4.user_id
    LEFT JOIN user_mast AS u5 ON u.created_by = u5.user_id
  `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }
    const userImagesBaseUrl = "http://3.88.87.80:8000/user_images/";
    // Process the data and add the image URLs to the response
    const dataWithImageUrls = results.map((user) => ({
      ...user,
      image_url: user.field_value ? userImagesBaseUrl + user.field_value : null,
    }));

    res.send({ data: dataWithImageUrls }); // Send the updated data back to the client
  });
});

module.exports = app;
