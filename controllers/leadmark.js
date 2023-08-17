const express = require("express");
const app = express.Router();
// const multer = require("multer");

const connection = require("../db");
//14/8/23 post leadmark_mast
app.post("/postleadmarkmast", async (req, res) => {
  console.log("post leadmark_mast api hit");

  try {
    // Extract data from the request body
    const {
      leadmast_id,
      call_update,
      callupdate_detail,
      lead_status,
      prospect_status,
      cust_owner,
      remark,
      remarkupdate_date,
      remarkupdate_time,
      followup_date,
      followup_time,
    } = req.body;

    const leadmastId = leadmast_id || 0;
    const callUpdate = call_update || "";
    const callupdateDetail = callupdate_detail || "";

    const leadStatus = lead_status || "";
    const prospectStatus = prospect_status || "";
    const custOwner = cust_owner || "";
    const remarkValue = remark || "";
    const remarkupdateDate = new Date();

    const currentDate = new Date();
    const currentHours = currentDate.getHours().toString().padStart(2, "0");
    const currentMinutes = currentDate.getMinutes().toString().padStart(2, "0");
    const currentSeconds = currentDate.getSeconds().toString().padStart(2, "0");
    const currentTime = `${currentHours}:${currentMinutes}:${currentSeconds}`;

    const remarkupdateTime = currentTime;
    const followup_Date = followup_date || "";
    const followupTime = followup_time || "";

    const query =
      "INSERT INTO leadremark_mast (leadmast_id, call_update, callupdate_detail, lead_status, prospect_status, cust_owner, remark, remarkupd_date, remarkupdate_time, followup_date, followup_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      leadmastId,
      callUpdate,
      callupdateDetail,
      leadStatus,
      prospectStatus,
      custOwner,
      remarkValue,
      remarkupdateDate,
      remarkupdateTime,
      followup_Date,
      followupTime,
    ];

    const result = await connection.promise().query(query, values);

    // console.log('Leadmark mast added successfully');
    res.status(200).send("Leadmark mast added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add leadmark to the database");
  }
});
// get all data of leadmark_mast
app.get("/allleadmarkmastdata", (req, res) => {
  // console.log("get dept api hit");
  const query = `
      SELECT
      *
      FROM
      leadremark_mast 
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
// update data of leadmark_mast
app.put("/updateleadmarkmast", (req, res) => {
  const leadmarkId = req.body.leadmark_id;
  const {
    // Extract the updated data from the request body
    call_update,
    callupdate_detail,
    lead_status,
    prospect_status,
    cust_owner,
    remark,
    followup_date,
    followup_time,
  } = req.body;

  // Construct the SQL query for updating the data
  const query = `
      UPDATE leadremark_mast
      SET
        call_update = ?,
        callupdate_detail = ?,
        lead_status = ?,
        prospect_status = ?,
        cust_owner = ?,
        remark = ?,
        followup_date = ?,
        followup_time = ?
      WHERE leadremark_id = ?
    `;

  // Execute the query with the provided data
  connection.query(
    query,
    [
      call_update,
      callupdate_detail,
      lead_status,
      prospect_status,
      cust_owner,
      remark,
      followup_date,
      followup_time,
      leadmarkId,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      // Check if any rows were affected
      if (result.affectedRows === 0) {
        res.status(404).send("Leadmark ID not found");
        return;
      }

      res.status(200).send("Leadmark data updated successfully");
    }
  );
});
module.exports = app;
