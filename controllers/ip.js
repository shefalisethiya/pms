const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
//post ipalloc data
app.post("/ipalloc", async (req, res) => {
  console.log("post ipalloc api hit");
  const d1 = new Date();
  try {
    // Extract data from the request body
    const {
      allocation_date,
      assigned_by,
      allocation_remark,
      allocation_to,
      ip_name,
      last_updated_by,
      last_updated_at,
      report_L1,
      report_L2,
      report_L3,
    } = req.body;

    // If any field is not defined or is empty, set it to null
    const allocationDate = allocation_date || null;
    const assignedBy = assigned_by || null;
    const allocationRemark = allocation_remark || null;
    const allocationTo = allocation_to || null;
    const last_updatedBy = last_updated_by ? parseInt(last_updated_by) : null;
    const last_updatedAt = last_updated_at ? parseInt(last_updated_at) : null;
    const ipName = ip_name ? parseInt(ip_name) : 0;

    // Insert the new record into the database using a parameterized query
    const query = `INSERT INTO Ip_allocation_mast (allocation_date, assigned_by, allocation_remark, allocation_to, last_updated_at, last_updated_by,ip_name)
      VALUES (?, ?, ?, ?, ?, ?,?)`;

    const values = [
      allocationDate,
      assignedBy,
      allocationRemark,
      allocationTo,
      last_updatedAt,
      last_updatedBy,
      ipName,
    ];

    const result = await connection.promise().query(query, values);

    console.log("ip alloc added successfully");
    res.status(200).send("ip alloc added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding ip alloc to database");
  }
});

// get all data of ip alloc
app.get("/alldataofipalloc", (req, res) => {
  console.log("all data of ip alloc with join");
  connection.query(
    `SELECT 
    ipm.*, 
    u1.user_name AS assigned_by_name,
    u2.user_name AS allocation_to_name,
    u3.user_name AS revoke_by_name
  FROM 
  Ip_allocation_mast AS ipm
    LEFT JOIN user_mast AS u1 ON u1.user_id = ipm.assigned_by 
    LEFT JOIN user_mast AS u2 ON u2.user_id = ipm.allocation_to  
    LEFT JOIN user_mast AS u3 ON u3.user_id = ipm.revoke_by   
`,
    (err, results, fields) => {
      if (err) {
        console.error("Error retrieving data from database: " + err.stack);
        return res
          .status(500)
          .json({ message: "Error retrieving data from database" });
      }
      return res.json(results);
    }
  );
});
// get data by ip_id
app.get("/dataofipalloc/:ip_id", (req, res) => {
  const ipId = req.params.ip_id;

  const query = "SELECT * FROM Ip_allocation_mast WHERE ip_id = ?";

  connection.query(query, [ipId], (err, results, fields) => {
    if (err) {
      console.error("Error retrieving data from database: " + err.stack);
      return res
        .status(500)
        .json({ message: "Error retrieving data from database" });
    }
    return res.json(results);
  });
});
// update ip alloc 13/7/23 10:43
app.put("/ipallocupdate", async (req, res) => {
  console.log("PUT /ipallocupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const {
      id,
      allocation_date,
      assigned_by,
      allocation_remark,
      allocation_to,
      revoke_date,
      revoke_reason,
      revoke_by,
      last_updated_at,
      last_updated_by,
      remark,
    } = req.body;

    // Check if allocation_date is defined and not empty, otherwise set it to an empty string
    const allocationDate = allocation_date || "";
    const assignedBy = assigned_by ? parseInt(assigned_by) : 0;
    const allocationRemark = allocation_remark || "";
    const allocationTo = allocation_to ? parseInt(allocation_to) : 0;
    const revokeDate = revoke_date || "";
    const revokeReason = revoke_reason || "";
    const revokeBy = revoke_by ? parseInt(revoke_by) : 0;
    const lastUpdatedBy = last_updated_by ? parseInt(last_updated_by) : 0;
    const Remark = remark || "";

    // Retrieve the existing IP allocation record from the database
    const getIPAllocationQuery =
      "SELECT * FROM Ip_allocation_mast WHERE ip_id = ?";
    const [existingIPAllocation] = await connection
      .promise()
      .query(getIPAllocationQuery, [id]);

    if (!existingIPAllocation || !existingIPAllocation.length) {
      return res.status(404).send("IP allocation record not found");
    }

    // Update the IP allocation details in the database
    const updateQuery =
      "UPDATE Ip_allocation_mast SET allocation_date = ?, assigned_by = ?, allocation_remark = ?, allocation_to = ?, revoke_date = ?, revoke_reason = ?, revoke_by = ?, last_updated_at = ?, last_updated_by = ?, remark = ? WHERE ip_id = ?";
    const updateValues = [
      allocationDate,
      assignedBy,
      allocationRemark,
      allocationTo,
      revokeDate,
      revokeReason,
      revokeBy,
      currentDate,
      lastUpdatedBy,
      Remark,
      id,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("IP allocation details updated successfully");
    res.status(200).send("IP allocation details updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error updating the IP allocation details in the database: " +
          error.message
      );
  }
});
app.delete("/ipallocdelete/:id", (req, res) => {
  const id = req.params.id;
  console.log("for ip alloc  deleteid##", id);
  connection.query(
    "DELETE FROM Ip_allocation_mast  WHERE ip_id   = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `ip alloc with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `ip alloc with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
//post ipregi data
app.post("/ipregi", async (req, res) => {
  console.log("post ipregis api hit");
  const currentDate = new Date();
  try {
    // Extract data from the request body
    const {
      ip_type,
      platform,
      ip_name,
      password,
      backup_code,
      contact_no,
      email,
      email_pass,
      recovery_email,
      recovery_contact,
      allocated_to_primary,
      created_by,
      created_at,
      last_updated_by,
      last_updated_at,
      report_L1,
      report_L2,
      report_L3,
      post_count,
      followers,
      days_reach,
    } = req.body;

    // If any field is not defined or is empty, set it to null
    const ipType = ip_type || null;
    const Platform = platform || null;
    const ipName = ip_name || null;
    const Password = password || null;
    const backupCode = backup_code || null;
    const contactNo = contact_no || null;
    const Email = email || null;
    const emailPass = email_pass || null;
    const recoveryEmail = recovery_email || null;
    const recoveryContact = recovery_contact || null;
    const allocatedToPrimary =
      allocated_to_primary !== undefined && allocated_to_primary !== ""
        ? parseInt(allocated_to_primary)
        : null;
    const createdBy = created_by ? parseInt(created_by) : 0;
    const createdAt = created_at;
    const updatedBy = last_updated_by ? parseInt(created_by) : 0;
    const updatedAt = last_updated_at;
    const reportL1 = report_L1 ? parseInt(report_L1) : 0;
    const reportL2 = report_L2 ? parseInt(report_L2) : 0;
    const reportL3 = report_L3 ? parseInt(report_L3) : 0;
    const postCont = post_count || null;
    const follows = followers || null;
    const daysReach = days_reach || null;

    // Insert the new record into the database using a parameterized query
    const query = `INSERT INTO Ip_register_mast (ip_type, platform, ip_name, password, backup_code, contact_no, email, email_pass, recovery_email, recovery_contact, allocated_to_primary, created_by, created_at, last_updated_by, last_updated_at, report_L1, report_L2, report_L3, post_count, followers, days_reach )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      ipType,
      Platform,
      ipName,
      Password,
      backupCode,
      contactNo,
      Email,
      emailPass,
      recoveryEmail,
      recoveryContact,
      allocatedToPrimary,
      createdBy,
      createdAt,
      updatedBy,
      updatedAt,
      reportL1,
      reportL2,
      reportL3,
      postCont,
      follows,
      daysReach,
    ];

    // await connection.promise().query(query, values);
    const insertResult = await connection.promise().query(query, values);
    // console.log("insertResult##", insertResult);
    const lastInsertedId = insertResult[0].insertId;
    // console.log("lastInsertedId##", lastInsertedId);
    const secondInsertQuery = `INSERT INTO Ip_count_mast (ip_id, last_updated_by, last_updated_at, post_count, followers, days_reach) VALUES (?,?,?,?,?,?)`;
    const secondInsertValues = [
      lastInsertedId,
      updatedBy,
      updatedAt,
      postCont,
      follows,
      daysReach,
    ];
    await connection.promise().query(secondInsertQuery, secondInsertValues);

    console.log("ip regis added successfully");
    res.status(200).send("ip alloc added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding ip alloc to database");
  }
});
app.get("/alldataofipregis", (req, res) => {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  connection.query(
    `SELECT
    ipr.*,
    u1.user_email_id AS allocated_to_primary_name,
    ipm.name AS ip_type_name,
    IFNULL(f1.followers, 0) AS followers1,
    IFNULL(f2.followers, 0) AS followers2,
    f1.last_updated_at AS last_updated_at1,
    f2.last_updated_at AS last_updated_at2
FROM
    Ip_register_mast AS ipr
LEFT JOIN user_mast AS u1 ON u1.user_id = ipr.allocated_to_primary
LEFT JOIN IpType_mast AS ipm ON ipm.id = ipr.ip_type
LEFT JOIN (
    SELECT
        ip_id,
        followers,
        last_updated_at,
        ROW_NUMBER() OVER (PARTITION BY ip_id ORDER BY last_updated_at DESC) AS row_num
    FROM
        Ip_count_mast
) AS f1 ON f1.ip_id = ipr.ip_regist_id AND f1.row_num = 1
LEFT JOIN (
    SELECT
        ip_id,
        followers,
        last_updated_at,
        ROW_NUMBER() OVER (PARTITION BY ip_id ORDER BY last_updated_at DESC) AS row_num
    FROM
        Ip_count_mast
) AS f2 ON f2.ip_id = ipr.ip_regist_id AND f2.row_num = 2;


  `,
    (err, results, fields) => {
      if (err) {
        console.error("Error retrieving data from database: " + err.stack);
        return res
          .status(500)
          .json({ message: "Error retrieving data from database" });
      }
      return res.json(results);
    }
  );
});

// get data by ip_regis_id
// Get data by ip_regis_id
app.get("/dataofipregis/:ip_regis_id", (req, res) => {
  const ipRegistId = req.params.ip_regis_id; // Use req.query instead of req.body to get query parameters
  console.log("ipRegistId", ipRegistId);
  const query = `
  SELECT
  ipr.*,
  u1.user_email_id AS allocated_to_primary_name,
  u3.user_name AS report_L1_user_name,
  u4.user_name AS report_L2_user_name,
  u5.user_name AS report_L3_user_name
FROM
  Ip_register_mast AS ipr
  LEFT JOIN user_mast AS u1 ON u1.user_id = ipr.allocated_to_primary
  LEFT JOIN user_mast AS u3 ON u3.user_id = ipr.report_L1
  LEFT JOIN user_mast AS u4 ON u4.user_id = ipr.report_L2
  LEFT JOIN user_mast AS u5 ON u5.user_id = ipr.report_L3
WHERE
  ipr.ip_regist_id = ?;

  `;

  connection.query(query, [ipRegistId], (err, results, fields) => {
    if (err) {
      console.error("Error retrieving data from the database: " + err.stack);
      return res
        .status(500)
        .json({ message: "Error retrieving data from the database" });
    }
    return res.json(results);
  });
});

// update ip regis data
app.put("/ipregiupdate", async (req, res) => {
  console.log("PUT /ipregiupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const {
      id,
      ip_type,
      platform,
      ip_name,
      password,
      backup_code,
      contact_no,
      email,
      email_pass,
      recovery_email,
      recovery_contact,
      allocated_to_primary,
      created_by,
      created_at,
      last_updated_by,
      last_updated_at,
      report_L1,
      report_L2,
      report_L3,
      post_count,
      followers,
      days_reach,
    } = req.body;

    // Check if ip_type is defined and not empty, otherwise set it to an empty string
    const ipType = ip_type || null;
    const Platform = platform || null;
    const ipName = ip_name || null;
    const Password = password || null;
    const backupCode = backup_code || null;
    const contactNo = contact_no || null;
    const Email = email || null;
    const emailPass = email_pass || null;
    const recoveryEmail = recovery_email || null;
    const recoveryContact = recovery_contact || null;
    const allocatedToPrimary =
      allocated_to_primary !== undefined && allocated_to_primary !== ""
        ? parseInt(allocated_to_primary)
        : null;
    const createdBy = created_by ? parseInt(created_by) : 0;
    const createdAt = created_at;
    const updatedBy = last_updated_by ? parseInt(created_by) : 0;
    const updatedAt = last_updated_at;
    const reportL1 = report_L1 ? parseInt(report_L1) : 0;
    const reportL2 = report_L2 ? parseInt(report_L2) : 0;
    const reportL3 = report_L3 ? parseInt(report_L3) : 0;
    const postCont = post_count || null;
    const follows = followers || null;
    const daysReach = days_reach || null;

    // Retrieve the existing product from the database
    const getProductQuery =
      "SELECT * FROM Ip_register_mast WHERE ip_regist_id = ?";
    const [existingProduct] = await connection
      .promise()
      .query(getProductQuery, [id]);

    if (!existingProduct || !existingProduct.length) {
      return res.status(404).send("IP register not found");
    }

    // Update the IP register in the database
    const updateQuery =
      "UPDATE Ip_register_mast SET ip_type = ?, platform = ?, ip_name = ?, password = ?, backup_code = ?, contact_no = ?, email = ?, email_pass = ?, recovery_email = ?, recovery_contact = ?, allocated_to_primary = ?, created_by = ?, created_at = ?, last_updated_by = ?, last_updated_at = ?, report_L1 =?,report_L2=?,report_L3=?, post_count = ?, followers = ?, days_reach = ? WHERE ip_regist_id = ?";
    const updateValues = [
      ipType,
      Platform,
      ipName,
      Password,
      backupCode,
      contactNo,
      Email,
      emailPass,
      recoveryEmail,
      recoveryContact,
      allocatedToPrimary,
      createdBy,
      createdAt,
      updatedBy,
      updatedAt,
      reportL1,
      reportL2,
      reportL3,
      postCont,
      follows,
      daysReach,
      id,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("IP register updated successfully");
    res.status(200).send("IP register updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the IP register in the database: " + error.message);
  }
});
// delete ip regi data
app.delete("/ipregsidelete/:id", (req, res) => {
  const id = req.params.id;
  console.log("for ip regis  deleteid##", id);
  connection.query(
    "DELETE FROM Ip_register_mast WHERE ip_regist_id  = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `ip regsi with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `ip regi with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
app.get("/getpartidataofipregi/:ip_regis_id", (req, res) => {
  const ipRegistId = req.params.ip_regis_id;
  console.log("ipRegistId", ipRegistId);
  const query = `
    SELECT 
    ip_name, password
    FROM Ip_register_mast 
    WHERE ip_regist_id = ?;
  `;

  connection.query(query, [ipRegistId], (err, results, fields) => {
    if (err) {
      console.error("Error retrieving data from the database: " + err.stack);
      return res
        .status(500)
        .json({ message: "Error retrieving data from the database" });
    }
    return res.json(results);
  });
});
// app.post("/passchange", async (req, res) => {
//   console.log("post pass change api hit");

//   try {
//     // Extract data from the request body
//     const { ip_name, old_password, new_password, ip_id, remark } = req.body;

//     // If ip_name, old_password, new_password, or ip_id is not defined or is empty, return an error
//     if (!ip_name || !old_password || !new_password || !ip_id) {
//       return res.status(400).send("Missing required fields");
//     }

//     // Update the password in the Ip_register_mast table
//     const updateQuery =
//       "UPDATE Ip_register_mast SET password = ? WHERE ip_regist_id  = ?";
//     const updateValues = [new_password, ip_id];

//     await connection.promise().query(updateQuery, updateValues);

//     // Insert the data into the password_change table
//     const insertQuery =
//       "INSERT INTO password_change (ip_name, old_password, new_password, created_at, remark) VALUES (?, ?, ?, ?, ?)";
//     const currentDate = new Date();
//     const insertValues = [
//       ip_name,
//       old_password,
//       new_password,
//       currentDate,
//       remark,
//     ];

//     await connection.promise().query(insertQuery, insertValues);

//     console.log("Password updated successfully");
//     res.status(200).send("Password updated successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error updating password in the database");
//   }
// });

//get alldataofpasschage
// app.get("/alldataofpasschange", (req, res) => {
//   console.log("Retrieving all passchage information");

//   const query = `SELECT * from  password_change`;

//   // Send the query to the MySQL database and handle any errors or data retrieved
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error(err);
//       res.sendStatus(500); // Send HTTP status code 500 for server error
//       return;
//     }

//     const data = results; // Store the retrieved data in a variable

//     res.send({ data: data }); // Send the data back to the client
//   });
// });
// 22/7/23 post api of platform_mast
app.post("/platform", async (req, res) => {
  console.log("post platform api hit");

  try {
    // Extract data from the request body
    const { name, created_by } = req.body;

    const Name = name || "";
    // const userId = user_id || 0;

    // Check if remark is defined and convert to string
    // const Description = description || "";
    const created_By = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query = `INSERT INTO platform_mast  (name , created_at ,created_by) VALUES (?, ?,?)`;
    const values = [
      Name,

      creation_date, // Actual Creation_date value (e.g., '2023-07-21')
      created_By, // Actual Created_by value (e.g., 2)
    ];

    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("platform_mast added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add platform_mast to database");
  }
});
// get all data platform _mast
app.get("/alldataofplatform", (req, res) => {
  connection.query(
    `SELECT pm.*, um.user_name AS created_by_name 
    FROM platform_mast AS pm 
    LEFT JOIN user_mast AS um ON pm.created_by = um.user_id`,
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
// update platform mast data
app.put("/platformupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { name, remark, last_updated_by } = req.body;
  const Id = req.body.id; // Use "Id" instead of "id"

  // Update platform record in the database
  connection.query(
    "UPDATE platform_mast SET name = ?, remark = ?, last_updated_at  = ?, last_updated_by = ? WHERE id = ?",
    [name, remark, d1, last_updated_by, Id], // Use "Id" instead of "id"
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `Platform with ID ${Id} not found`; // Use "Id" instead of "id"
        res.status(404).send(message);
        return;
      }
      const message = `Platform with ID ${Id} updated successfully`; // Use "Id" instead of "id"
      res.status(200).send({ message });
    }
  );
});
app.get("/dataofplatform/:platformId", (req, res) => {
  const platformId = req.params.platformId; // Get the platform ID from the URL parameter

  connection.query(
    `SELECT pm.*, um.user_name AS created_by_name 
    FROM platform_mast AS pm 
    LEFT JOIN user_mast AS um ON pm.created_by = um.user_id
    WHERE pm.id = ?`,
    [platformId], // Use the platform ID as a parameter in the query
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
//delete platform_ mast data
app.delete("/platformdelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM platform_mast WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `platfrom data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `platform with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
app.post("/Iptype", async (req, res) => {
  console.log("post IPtype api hit");

  try {
    // Extract data from the request body
    const { name, created_by, remark } = req.body;

    const Name = name || "";
    const Remark = remark || "";
    // const userId = user_id || 0;

    // Check if remark is defined and convert to string
    // const Description = description || "";
    const created_By = created_by || 0;

    // Get the current date
    const currentDate = new Date();
    const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

    // Check if location_id is defined and convert to integer
    // const locationIdValue = location_id ? parseInt(location_id) : 0;

    // Insert the new lead type into the database using a parameterized query
    const query = `INSERT INTO IpType_mast    (name , created_at ,created_by,remark ) VALUES (?, ?,?,?)`;
    const values = [
      Name,

      creation_date, // Actual Creation_date value (e.g., '2023-07-21')
      created_By, // Actual Created_by value (e.g., 2)
      Remark,
    ];

    const result = await connection.promise().query(query, values);

    // console.log('Department added successfully');
    res.status(200).send("IpType_mast  added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add IpType_mast  to database");
  }
});
// get all data of accesstype

app.get("/alldataofIptype", (req, res) => {
  connection.query(
    `SELECT pm.*, um.user_name AS created_by_name 
    FROM IpType_mast   AS pm 
    LEFT JOIN user_mast AS um ON pm.created_by = um.user_id`,
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
// get data by id
app.get("/Iptypedata/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM IpType_mast   WHERE id = ?`,
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
// delete data of accestype
app.delete("/Iptypedelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM IpType_mast   WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `platfrom data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `platform with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// update platform mast data
app.put("/IPtypeupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { name, remark, last_updated_by } = req.body;
  const Id = req.body.id; // Use "Id" instead of "id"

  // Update platform record in the database
  connection.query(
    "UPDATE IpType_mast  SET name = ?, remark = ?, last_updated_at  = ?, last_updated_by = ? WHERE id = ?",
    [name, remark, d1, last_updated_by, Id], // Use "Id" instead of "id"
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `Platform with ID ${Id} not found`; // Use "Id" instead of "id"
        res.status(404).send(message);
        return;
      }
      const message = `Platform with ID ${Id} updated successfully`; // Use "Id" instead of "id"
      res.status(200).send({ message });
    }
  );
});
// code by abhishek sir 4/8/23
app.post("/ipcountpost", async (req, res) => {
  console.log("post ipcountpost api hit");
  const currentDate = new Date();
  try {
    // Extract data from the request body
    const {
      ip_id,
      last_updated_by,
      last_updated_at,
      post_count,
      followers,
      days_reach,
    } = req.body;
    const ipID = ip_id || null;
    const updatedBy = last_updated_by || 0;
    const updatedAt = currentDate;
    const postCont = post_count || null;
    const follows = followers || null;
    const daysReach = days_reach || null;
    const query = `INSERT INTO Ip_count_mast (ip_id, last_updated_by, last_updated_at, post_count, followers, days_reach )
      VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [ipID, updatedBy, updatedAt, postCont, follows, daysReach];
    await connection.promise().query(query, values);
    console.log("ip count added successfully");
    res.status(200).send("ip count added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding ip count to database");
  }
});
app.get("/lastdataofipcount/:ip_id", (req, res) => {
  const ipRegistId = req.params.ip_id;
  console.log("ipRegistId", ipRegistId);
  const query = `SELECT icm.*, irm.ip_name
  FROM Ip_count_mast AS icm
  JOIN Ip_register_mast AS irm ON icm.ip_id = irm.ip_regist_id
  WHERE icm.ip_id = ? ORDER BY id DESC LIMIT 1;`;
  connection.query(query, [ipRegistId], (err, results, fields) => {
    if (err) {
      console.error("Error retrieving data from the database: " + err.stack);
      return res
        .status(500)
        .json({ message: "Error retrieving data from the database" });
    }
    return res.json(results);
  });
});
app.get("/dataofiphistory/:ip_id", (req, res) => {
  const ipRegistId = req.params.ip_id;
  console.log("ipRegistId", ipRegistId);
  const query = `SELECT icm.*, irm.ip_name
  FROM Ip_count_mast AS icm
  JOIN Ip_register_mast AS irm ON icm.ip_id = irm.ip_regist_id
  WHERE icm.ip_id = ?`;
  connection.query(query, [ipRegistId], (err, results, fields) => {
    if (err) {
      console.error("Error retrieving data from the database: " + err.stack);
      return res
        .status(500)
        .json({ message: "Error retrieving data from the database" });
    }
    return res.json(results);
  });
});
module.exports = app;
