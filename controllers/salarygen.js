const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
// post salary generation
app.post("/salarygen", async (req, res) => {
  console.log("post salary generation  api hit");

  try {
    // Extract data from the request body
    const {
      emp_id,
      dept_id,
      absent_days,
      total_salary,
      tds_deduction,
      remark,
      created_by,
    } = req.body;

    // If dept_name is not defined or is empty, set it to an empty string
    const empId = emp_id || 0;
    const deptId = dept_id || 0;
    const work_days = 26; // Set the work_days to 26 as per your requirement

    const presentDays = work_days - absent_days;
    const perdaysal = total_salary / work_days;
    const totalSalary = perdaysal * presentDays;
    const tdsDeduction = (total_salary * tds_deduction) / 100; // Corrected calculation
    const netSalary = totalSalary - tdsDeduction;
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
      "INSERT INTO salary_genration (emp_id, dept_id, present_days, work_days, total_salary, tds_deduction, net_salary, remark, Creation_date, Created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      empId,
      deptId,
      presentDays,
      work_days,
      totalSalary,
      tdsDeduction,
      netSalary,
      remarkValue,
      creation_date,
      created_By,
      // locationIdValue,
    ];
    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("salary generation  added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add salarygen to the database");
  }
});
// 5/8/23 12:36 get data of salarygen
app.get("/alldataofsalarygen", (req, res) => {
  console.log("Retrieving all salary generation data");

  const query = `
    SELECT DISTINCT
    sg.*,
    um.user_name,
    am.month,
    am.year,
    dm.dept_name
  FROM 
    salary_genration AS sg
  LEFT JOIN user_mast AS um ON sg.emp_id = um.user_id
  LEFT JOIN dept_mast AS dm ON dm.dept_id = sg.dept_id
  LEFT JOIN attendence_mast AS am ON sg.emp_id = am.user_id;
  
    `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    // Process the data and add the image URLs to the response
    const dataWithImageUrls = results.map((salaryGenData) => ({
      ...salaryGenData,
      image_url: salaryGenData.image
        ? userImagesBaseUrl + salaryGenData.image
        : null,
      uid_url: salaryGenData.UID ? userImagesBaseUrl + salaryGenData.UID : null,
      pan_url: salaryGenData.pan ? userImagesBaseUrl + salaryGenData.pan : null,
      highest_upload_url: salaryGenData.highest_upload
        ? userImagesBaseUrl + salaryGenData.highest_upload
        : null,
      other_upload_url: salaryGenData.other_upload
        ? userImagesBaseUrl + salaryGenData.other_upload
        : null,
    }));

    res.send({ data: dataWithImageUrls }); // Send the updated data back to the client
  });
});

// get salry record by emp_id
app.get("/alldataofsalarygenbyempid", (req, res) => {
  console.log("Retrieving salary generation data by emp_id");

  // Get the emp_id from the request query parameters
  const emp_id = req.body.emp_id;

  // Construct the SQL query with a WHERE clause to filter by emp_id
  const query = `
      SELECT 
        sg.*, 
        d.dept_name AS department_name,
        u5.user_name AS emp_name
      FROM 
        salary_genration AS sg
        LEFT JOIN dept_mast AS d ON sg.dept_id = d.dept_id
        LEFT JOIN user_mast AS u5 ON sg.emp_id = u5.user_id
      WHERE
        sg.emp_id = ?;
    `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [emp_id], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    // Process the data and add the image URLs to the response
    const dataWithImageUrls = results.map((salaryGenData) => ({
      ...salaryGenData,
      image_url: salaryGenData.image
        ? userImagesBaseUrl + salaryGenData.image
        : null,
      uid_url: salaryGenData.UID ? userImagesBaseUrl + salaryGenData.UID : null,
      pan_url: salaryGenData.pan ? userImagesBaseUrl + salaryGenData.pan : null,
      highest_upload_url: salaryGenData.highest_upload
        ? userImagesBaseUrl + salaryGenData.highest_upload
        : null,
      other_upload_url: salaryGenData.other_upload
        ? userImagesBaseUrl + salaryGenData.other_upload
        : null,
    }));

    res.send({ data: dataWithImageUrls }); // Send the updated data back to the client
  });
});
//7/8/23update salaerygen
app.put("/salarygenupdate", (req, res) => {
  console.log("salarygenupdate hitted");
  var d1 = new Date();

  // Extract data from the request body
  const {
    emp_id,
    dept_id,
    present_days,
    total_salary,
    tds_deduction,
    net_salary,
    remark,
    Last_updated_by,
    Created_by,
  } = req.body;
  const id = req.body.id;

  // Update lead_type record in the database
  connection.query(
    "UPDATE announcement_mast SET emp_id = ?, dept_id = ?, present_days = ?, total_salary = ?, tds_deduction = ?, net_salary = ?, remark = ?, Last_updated_by = ?, last_updated_at  = ? WHERE id = ?",
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
module.exports = app;
