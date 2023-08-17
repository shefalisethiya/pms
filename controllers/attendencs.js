const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
app.get("/alldataofattendencedata", (req, res) => {
  console.log("get attendence api hit");
  connection.query(
    `SELECT am.*, um.user_name, dm.dept_name 
      FROM attendence_mast AS am
      LEFT JOIN user_mast AS um ON am.user_id = um.user_id
      LEFT JOIN dept_mast AS dm ON dm.dept_id = am.dept`,
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      // console.log(results);
      res.send(results);
    }
  );
});

//get data by attendence_id in attendence mast
app.get("/attendencemastdata/:id", (req, res) => {
  const attendencemast_id = req.params.id; // Get the lead_mast ID from the request parameters

  connection.query(
    "SELECT * FROM attendence_mast  WHERE attendence_id  = ?",
    [attendencemast_id],
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
//11/8/23 get attendence record by user_id
app.get("/attendencemastdatabuuserid/:userid", (req, res) => {
  const user_id = req.params.userid; // Get the user_id from the query parameters

  connection.query(
    "SELECT a.*, u.user_name As user_recordof FROM attendence_mast a JOIN user_mast u ON a.user_id = u.user_id WHERE a.user_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }

      // Send the array of objects in the response
      res.json(results);
    }
  );
});
// delete attendencemastdata by id
app.delete("/attendencemastdelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM attendence_mast WHERE attendence_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `attendencemast data with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `attendencemast with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
app.get("/allattendencemastdata", (req, res) => {
  // console.log("get dept api hit");
  const query = `
      SELECT
        adm.*,
        dm.dept_name,
       
        
        um.user_name 
      FROM
      attendence_mast AS adm
        LEFT JOIN dept_mast AS dm ON adm.dept = dm.dept_id
      
        LEFT JOIN user_mast AS um ON adm.user_id = um.user_id
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
module.exports = app;
