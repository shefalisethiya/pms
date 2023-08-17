const express = require("express");
const app = express.Router();
// const multer = require("multer");

const connection = require("../db");
//access_type_mast post api

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
// lead source curd api 31/7/23 4:28
app.post("/leadsourcepost", async (req, res) => {
  console.log("post leadsource api hit");

  try {
    // Extract data from the request body
    const { leadsource_name, lead_source_acc, remarks, created_by } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const Leadsource_name = leadsource_name || "";
    const Lead_source_acc = lead_source_acc || "";

    const Remarks = remarks || "";

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO lead_source (leadsource_name,lead_source_acc, remark, created_by, creation_date)
        VALUES (?, ?, ?, ?,?)`;

    const values = [
      Leadsource_name,
      Lead_source_acc,
      Remarks,
      created_By,
      creation_date,
    ];

    const result = await connection.promise().query(query, values);

    console.log("leadsource added successfully");
    res.status(200).send("leadsource added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding leadsource to database");
  }
});
// get all data of leadsource
app.get("/allleadsourcedata", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from lead_source `, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// get lead source data by id

app.get("/getleadsourcedata/:lead_id", async (req, res) => {
  try {
    const leadId = req.params.lead_id;

    // Retrieve the logo, category id, and category name from the database by logo_id
    const query = `
       select * from lead_source 
        WHERE leadsource_id  = ?
      `;
    const [result] = await connection.promise().query(query, [leadId]);

    // Send the JSON response
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving leadsource from the database:", error);
    res.status(500).send("Error retrieving leadsource from the database");
  }
});
// update leadsource databy id
app.put("/leadsourceupdate/:id", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { leadsource_name, lead_source_acc, remark, Last_updated_by } =
    req.body;
  const id = req.params.id;

  // Update department record in the database
  connection.query(
    "UPDATE lead_source SET leadsource_name = ?, lead_source_acc = ?, remark = ?, Last_updated_by = ?, Last_updated_date = ? WHERE leadsource_id = ?",
    [leadsource_name, lead_source_acc, remark, Last_updated_by, d1, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `leadsource with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadsource with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete lead source by id
app.delete("/leadsourcedelete", (req, res) => {
  // console.log("delete api hit");
  const id = req.body.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM lead_source WHERE leadsource_id  = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `leadsource data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadsource with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
//lead type curd apis 6:02
app.post("/leadtypepost", async (req, res) => {
  console.log("post leadtype api hit");

  try {
    // Extract data from the request body
    const { location, lead_type, remarks, created_by } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const Location = location || "";
    const Lead_type = lead_type || "";

    const Remarks = remarks || "";

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO lead_type (location,lead_type, remark, created_by, creation_date)
        VALUES (?, ?, ?, ?,?)`;

    const values = [Location, Lead_type, Remarks, created_By, creation_date];

    const result = await connection.promise().query(query, values);

    console.log("leadtype added successfully");
    res.status(200).send("leadtype added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding leadtype to database");
  }
});
// get all data of leadtype
app.get("/allleadtypedata", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from lead_type `, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// update leadtype data by id
// update leadsource databy id
app.put("/leadtypeupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const { location, lead_type, remark, Last_updated_by } = req.body;
  const id = req.body.id;

  // Update lead_type record in the database
  connection.query(
    "UPDATE lead_type SET location = ?, lead_type = ?, remark = ?, Last_updated_by = ?, Last_updated_date = ? WHERE leadtype_id = ?",
    [location, lead_type, remark, Last_updated_by, d1, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `leadtype with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadtype with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete leadtypedata by id
app.delete("/leadtypedelete", (req, res) => {
  // console.log("delete api hit");
  const id = req.body.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM lead_type   WHERE leadtype_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `leadtype data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadtype with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// post lead mast data
app.post("/leadmastpost", async (req, res) => {
  console.log("post leadmast api hit");

  try {
    // Extract data from the request body
    const {
      lead_name,
      mobile_no,
      alternate_mobile_no,
      leadsource,
      leadtype,
      dept,
      status,
      loc,
      email,
      addr,
      city,
      state,
      country,
      remarks,
      created_by,
      assign_to,
    } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const leadName = lead_name || "";
    const mobileNo = mobile_no || "";
    const alternate_mobileNo = alternate_mobile_no || "";
    const leadSource = leadsource || 0;
    const leadType = leadtype || 0;
    const Dept = dept || 0;
    const Status = status || "";
    const Loc = loc || 0;
    const Email = email || "";
    const Addr = addr || "";
    const City = city || "";
    const State = state || "";
    const Country = country || "";
    const Remarks = remarks || "";
    const assignTo = assign_to || 0;

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO lead_mast  (lead_name ,mobile_no,alternate_mobile_no,leadsource,leadtype,dept,status,loc, email,addr,city,state,country,remark,created_by, creation_date,assign_to)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const values = [
      leadName,
      mobileNo,
      alternate_mobileNo,
      leadSource,
      leadType,
      Dept,
      Status,
      Loc,
      Email,
      Addr,
      City,
      State,
      Country,
      Remarks,
      created_By,
      creation_date,
      assignTo,
    ];

    const result = await connection.promise().query(query, values);

    console.log("leadmast added successfully");
    res.status(200).send("leadmast added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding leadmast to database");
  }
});
//1/8/23
// get all data of leadmast
app.get("/allleadmastdata", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from lead_mast  `, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
//get data by id in lead mast
app.get("/leadmastdata/:id", (req, res) => {
  const leadmast_id = req.params.id; // Get the lead_mast ID from the request parameters

  connection.query(
    "SELECT * FROM lead_mast WHERE leadmast_id = ?",
    [leadmast_id],
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
        // If data found, send it in the response
        res.json(results[0]);
      }
    }
  );
});

// update leadmast databy id
app.put("/leadmastupdate", (req, res) => {
  console.log("leadmastupdate hitted");
  var d1 = new Date();

  // Extract data from the request body
  const {
    lead_name,
    mobile_no,
    alternate_mobile_no,
    leadsource,
    leadtype,
    dept,
    status,
    loc,
    email,
    addr,
    city,
    state,
    country,

    remark,
    Last_updated_by,
    assign_to,
  } = req.body;
  const id = req.body.id;

  // Update lead_type record in the database
  connection.query(
    "UPDATE lead_mast SET lead_name = ?, mobile_no  = ?,alternate_mobile_no=?,leadsource =?,leadtype=?,dept =?,status=?,loc=?,email=?,addr=?,city =?,state =?,country =?, remark = ?, Last_updated_by = ?, Last_updated_date = ?,assign_to=? WHERE leadmast_id = ?",
    [
      lead_name,
      mobile_no,
      alternate_mobile_no,
      leadsource,
      leadtype,
      dept,
      status,
      loc,
      email,
      addr,
      city,
      state,
      country,

      remark,
      Last_updated_by,
      d1,
      assign_to,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (result.affectedRows === 0) {
        const message = `leadtype with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadtype with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete leadmastdata by id
app.delete("/leadmastdelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM lead_mast   WHERE leadmast_id  = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `leadmast data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `leadmast with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
