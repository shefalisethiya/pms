const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
// 6/7/23 post sim mast
app.post("/simdata", async (req, res) => {
  console.log("post simdata api hit");

  try {
    // Extract data from the request body
    const {
      sim_no,
      provider,
      type,
      remark,
      created_by,
      status,
      mobileNumber,
      s_type,
      register,
      dept_id,
      desi_id,
    } = req.body;

    // If any field is not defined or is empty, set it to null or empty string
    const Sim_no = sim_no || "";
    const Provider = provider || "";
    const Type = type || "";
    const Remark = remark || "";
    const Created_by = created_by ? parseInt(created_by) : 0;
    const deptId = dept_id ? parseInt(dept_id) : 0;
    const desiId = desi_id ? parseInt(desi_id) : 0;
    const Status = status || "";
    const MobileNumber = mobileNumber || "";
    const S_type = s_type || "";
    const Register = register || "";

    // Insert the new simdata into the database using a parameterized query
    const query = `
      INSERT INTO sim_mast (sim_no, provider, type, Remarks, created_by, status, register, mobileNumber, s_type, Creation_date,desi ,dept)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?,?)
    `;

    const values = [
      Sim_no,
      Provider,
      Type,
      Remark,
      Created_by,
      Status,
      Register,
      MobileNumber,
      S_type,
      desiId,
      deptId,
    ];

    await connection.promise().query(query, values);

    console.log("simdata added successfully");
    res.status(200).send("simdata added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding simdata to database");
  }
});

// get all data of sim _mast

app.get("/alldataofsimmast", (req, res) => {
  console.log("Retrieving all Sim mast information");

  // const query = `
  //   SELECT sm.*, d.dept_name AS department_name, dsm.desi_name AS designation, um.user_name AS created_by_username
  //   FROM sim_mast AS sm
  //   LEFT JOIN dept_mast AS d ON sm.dept = d.dept_id
  //   LEFT JOIN designation_mast AS dsm ON sm.desi = dsm.desi_id
  //   LEFT JOIN user_mast AS um ON sm.created_by = um.user_id
  //   -- LEFT JOIN user_mast AS um2 ON sm.submitted_by = um2.user_id
  //   -- LEFT JOIN user_mast AS um3 ON sm.user_id = um3.user_id
  //   -- LEFT JOIN sim_mast AS sm ON sm.sim_id = sm.sim_id
  // `;

  const query = `
  SELECT
  sm.sim_id,
  MAX(sm.Last_updated_date) AS Last_updated_date,
  MAX(sm.status) AS status,
  MAX(sm.dept) AS dept,
  MAX(sm.desi) AS desi,
  MAX(sm.mobileNumber) AS mobileNumber,
  MAX(sm.sim_no) AS sim_no,
  MAX(sm.provider) AS provider,
  MAX(sm.type) AS type,
  MAX(sm.s_type) AS s_type,
  MAX(sm.created_by) AS created_by,
  MAX(sm.Remarks) AS Remarks,
  MAX(CASE WHEN sm.status = 'Allocated' AND am.submitted_at IS NULL THEN DATEDIFF(NOW(), sm.Last_updated_date) ELSE NULL END) AS date_difference,
  MAX(d.dept_name) AS department_name,
  MAX(dsm.desi_name) AS designation,
  MAX(um.user_name) AS created_by_username,
  MAX(um2.user_name) AS allocated_username,
  MAX(am.submitted_at) AS submitted_at
FROM sim_mast AS sm
LEFT JOIN dept_mast AS d ON sm.dept = d.dept_id
LEFT JOIN designation_mast AS dsm ON sm.desi = dsm.desi_id
LEFT JOIN user_mast AS um ON sm.created_by = um.user_id
LEFT JOIN allocation_mast AS am ON sm.sim_id = am.sim_id
LEFT JOIN user_mast AS um2 ON am.user_id = um2.user_id
GROUP BY sm.sim_id;

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
// check code of group sim_id and its count 24/7/23 12:04pm

//get data by sim_id from sim_mast
app.get("/simdata/:sim_id", (req, res) => {
  console.log("Retrieving Sim mast information for sim_id:", req.params.sim_id);

  const simId = req.params.sim_id;
  const query = `SELECT * FROM sim_mast WHERE sim_id = ?`;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [simId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results[0]; // Assuming sim_id is unique, use the first element of the results array

    res.send({ data: data }); // Send the data back to the client
  });
});
app.get("/simallocationdata/:sim_id", async (req, res) => {
  console.log("SIM allocation data by sim_id API hit:", req.params.sim_id);
  try {
    const simId = req.params.sim_id; // Get the sim_id from the request body

    console.log(`Retrieving SIM allo
    cation data for sim_id: ${simId}`);

    const query = `
      SELECT am.*, d.dept_name AS department_name, um.user_name AS created_by_username, um2.user_name AS submitted_by_username, um3.user_name AS user_name, sm.mobileNumber AS mobile_number
      FROM allocation_mast AS am
      LEFT JOIN dept_mast AS d ON am.dept_id = d.dept_id
      LEFT JOIN user_mast AS um ON am.created_by = um.user_id
      LEFT JOIN user_mast AS um2 ON am.submitted_by = um2.user_id
      LEFT JOIN user_mast AS um3 ON am.user_id = um3.user_id
      LEFT JOIN sim_mast AS sm ON am.sim_id = sm.sim_id
      WHERE am.sim_id = ? AND am.deleted_status = ?
    `;

    // Send the query to the MySQL database and handle any errors or data retrieved
    connection.query(query, [simId, 0], (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500); // Send HTTP status code 500 for server error
        return;
      }

      if (results.length === 0) {
        res.sendStatus(404); // Send HTTP status code 404 if no data found for the sim_id
        return;
      }

      const simAllocationData = results; // Retrieve the data

      res.status(200).json(simAllocationData); // Send the data as JSON response
    });
  } catch (error) {
    console.log("Internal Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// update sim_mast data
app.put("/simdataupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const {
    sim_no,
    provider,
    type,
    remark,
    status,
    mobilenumber,
    s_type,
    Last_updated_by,
    id,
    desi_id,
    dept_id,
    register,
  } = req.body;
  // const id = req.pag rams.id;
  console.log("simdataupdatebody", req.body);
  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    sim_no: sim_no || "",
    provider: provider || "",
    type: type || "",
    Remarks: remark || "",
    Status: status || "",
    mobileNumber: mobilenumber || "",
    s_type: s_type || "",
    Last_updated_by: Last_updated_by || 0,
    desi: desi_id || 0,
    dept: dept_id || 0,
    register: register || "",
    last_updated_date: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE  sim_mast SET ? WHERE  sim_id   = ?",

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
        const message = `sim record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `sim record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete sim data
app.delete("/simdatadelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM sim_mast WHERE sim_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `sim with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `sim with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// 6/7/23 post allocation data
app.post("/postsimalertment", async (req, res) => {
  console.log("post simalterment API hit");

  try {
    // Extract data from the request body
    const {
      user_id,
      sim_id,
      remark,
      created_by,
      dept_id,
      submitted_by,
      reason,
      status,
      deleted_status,
    } = req.body;
    console.log("req.body##");
    // If sitting_ref_no is not defined or is empty, set it to null
    const userId = user_id || "";
    const simId = sim_id || "";
    const deptId = dept_id || 0;
    const submittedBy = submitted_by || 0;
    const Remark = remark || "";
    const Reason = reason || "";
    const Status = status || "";
    const deleted_statusc = deleted_status || 0;

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();
    // const submission_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `
      INSERT INTO allocation_mast (user_id, sim_id, Remarks, dept_id, created_by, Creation_date, submitted_by, reason,status,deleted_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;

    const values = [
      userId,
      simId,
      Remark,
      deptId,
      created_By,
      creation_date,
      submittedBy,
      // submission_date,
      Reason,
      Status,
      deleted_statusc,
    ];
    console.log("values##", values);
    await connection.promise().query(query, values);

    console.log("sim allocation added successfully");
    res.status(200).send("sim allocation added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding sim allocation to database");
  }
});
app.get("/alldataofsimallocment", (req, res) => {
  console.log("Retrieving all Sim allocation information");

  // const query = `
  //   SELECT
  //     a.sim_id,
  //     s.sim_no AS simNo,
  //     s.mobileNumber AS mobileNo,
  //     s.type AS type,
  //     s.Remarks AS remark,
  //     u.user_id,
  //     u.user_name AS userName
  //   FROM allocation_mast a
  //   JOIN sim_mast s ON a.sim_id = s.sim_id
  //   JOIN user_mast u ON a.user_id = u.user_id;
  // `;
  const query = `
  SELECT 
  a.sim_id,
  a.allo_id,
  a.reason,
  a.submitted_at,
  a.submitted_by,
  s.sim_no AS simNo,
  s.mobileNumber AS mobileNo,
  s.type AS type,
  s.Remarks AS remark,
  u.user_id,
  u.user_name AS userName,
  u.dept_id AS dept_id,
  u.user_designation AS user_designation,
  d.dept_name AS dept_name,
  des.desi_name AS desi_name
FROM allocation_mast a
LEFT JOIN sim_mast s ON a.sim_id = s.sim_id
LEFT JOIN user_mast u ON a.user_id = u.user_id
LEFT JOIN dept_mast d ON u.dept_id = d.dept_id
LEFT JOIN designation_mast des ON u.user_designation = des.desi_id
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
// duration of sim allocatment
// app.get("/alldataofsimallocment", (req, res) => {
app.get("/alldataofsimallocmentnew", (req, res) => {
  console.log("Retrieving all Sim allocation information");

  const query = `
    SELECT 
      a.sim_id,
      s.sim_no AS simNo,
      s.mobileNumber AS mobileNo,
      s.type AS type,
      s.Remarks AS remark,
      u.user_id,
      u.user_name AS userName,
      TIMESTAMPDIFF(SECOND, a.created_at, a.last_updated_at) AS timeDifference
    FROM allocation_mast a
    JOIN sim_mast s ON a.sim_id = s.sim_id
    JOIN user_mast u ON a.user_id = u.user_id;
  `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.send({ data: data }); // Send the data back to the client
  });
});

// group simid data of allocment
app.get("/groupalldataofsimallocment", (req, res) => {
  console.log("Retrieving all Sim allocation information");

  const query = `
    SELECT 
      a.sim_id,
      s.sim_no AS simNo,
      s.mobileNumber AS mobileNo,
      s.type AS type,
      s.Remarks AS remark,
      // u.user_id,
      // u.user_name AS userName,
      COUNT(a.sim_id) AS allocationCount
    FROM allocation_mast a
    JOIN sim_mast s ON a.sim_id = s.sim_id
    // JOIN user_mast u ON a.user_id = u.user_id
    GROUP BY a.sim_id, s.sim_no, s.mobileNumber, s.type, s.Remarks;
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
// duration api
app.get("/durationalldataofsimallocment", (req, res) => {
  console.log("Retrieving all Sim allocation information");

  const query = `
    SELECT 
      a.sim_id,
      s.sim_no AS simNo,
      s.mobileNumber AS mobileNo,
      s.type AS type,
      s.Remarks AS remark,
      u.user_id,
      u.user_name AS userName,
      TIMESTAMPDIFF(SECOND, a.Creation_date , a.Last_updated_date ) AS timeDifference
    FROM allocation_mast a
    JOIN sim_mast s ON a.sim_id = s.sim_id
    JOIN user_mast u ON a.user_id = u.user_id;
  `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.send({ data: data }); // Send the data back to the client
  });
});

//get data of sim allocment by alloc_id 10/7/23
app.get("/dataofsimallocment/:allo_id", (req, res) => {
  console.log("Retrieving Sim mast information for allo_id:", req.body.sim_id);

  const alloId = req.params.allo_id;
  const query = `SELECT a.*, s.sim_id, s.sim_no AS simNo,s.mobileNumber  AS mobileNo, s.type AS type, s.Remarks AS remark, u.user_id, u.user_name AS userName
  FROM allocation_mast a
  JOIN sim_mast s ON a.sim_id = s.sim_id
  JOIN user_mast u ON a.user_id = u.user_id  WHERE allo_id = ?`;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [alloId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results[0]; // Assuming sim_id is unique, use the first element of the results array

    res.send({ data: data }); // Send the data back to the client
  });
});
// get data y sim_id
app.get("/dataofsimallocmentbysimid", (req, res) => {
  console.log(
    "Retrieving Sim allocation information for sim_id:",
    req.body.sim_id
  );

  const simId = req.body.sim_id;
  console.log("simId", simId);
  const query = `
    SELECT a.*, s.sim_id, s.sim_no AS simNo, s.mobileNumber AS mobileNo, s.type AS type, s.Remarks AS remark, u.user_id, u.user_name AS userName, u2.user_name AS created_by, u3.user_name AS submitted_by
    FROM allocation_mast a
    JOIN sim_mast s ON a.sim_id = s.sim_id
    JOIN user_mast u ON a.user_id = u.user_id
    JOIN user_mast u2 ON a.created_by = u2.user_id
    JOIN user_mast u3 ON a.submitted_by = u3.user_id
    WHERE a.sim_id = ?`;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [simId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable
    console.log("data##", data);
    res.send({ data: data }); // Send the data back to the client
  });
});
// update sim_alloctment data
app.put("/simallocmentdatagupdate", (req, res) => {
  var d1 = new Date();
  // const submission_date = new Date();
  // Extract data from the request body and URL parameter
  const {
    user_id,
    sim_id,
    Last_updated_by,
    id,
    dept_id,
    submitted_by,
    submitted_at,
    Reason,
    status,
    deleted_status,
  } = req.body;
  // const id = req.pag rams.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    user_id: user_id || 0,
    sim_id: sim_id || 0,
    dept_id: dept_id || 0,
    // type: type || "",
    // Remarks: remark || "",
    status: status || "",
    reason: Reason || "",
    submitted_by: submitted_by || 0,
    Last_updated_by: Last_updated_by || 0,
    submitted_at,
    Last_updated_date: d1,
    deleted_status: deleted_status,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE  allocation_mast SET ? WHERE  allo_id    = ?",
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
        const message = `allocment  record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `allocment record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
//21/7/23 1:22pm
app.delete("/simallocmentdatagdelete/:id", (req, res) => {
  const id = req.params.id;

  // Delete the allocation record from the database using the provided ID
  connection.query(
    "DELETE FROM allocation_mast WHERE allo_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        // If an error occurs during the delete query, send a 500 status code
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        // If no rows were affected by the delete query, the allocation record with the provided ID was not found
        const message = `Allocation record with ID ${id} not found`;
        res.status(404).send({ message });
        return;
      }
      // If the delete query was successful and at least one row was affected, send a success message
      const message = `Allocation record with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});

// delete simallocment data
app.delete("/simallocmentdatadelete", (req, res) => {
  // console.log("delete api hit");
  const id = req.body.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM allocation_mast WHERE allo_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `sim with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `sim with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
