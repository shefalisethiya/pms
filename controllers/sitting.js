const express = require("express");
const app = express.Router();
// const multer = require("multer");

const connection = require("../db");
//post sitting data
app.post("/sitting", async (req, res) => {
  console.log("post sitting api hit");

  try {
    // Extract data from the request body
    const { sitting_ref_no, sitting_area, remarks, room_id, created_by } =
      req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const Sitting_ref_no = sitting_ref_no || "";
    const Sitting_area = sitting_area || "";
    const Remarks = remarks || "";
    const created_By = created_by ? parseInt(created_by) : 0;
    // Check if created_by is defined and convert to integer
    const room_Id = room_id ? parseInt(room_id) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO Sitting_mast (sitting_ref_no, sitting_area, remarks,room_id, created_by, creation_date)
      VALUES (?, ?, ?, ?,?, ?)`;

    const values = [
      Sitting_ref_no,
      Sitting_area,
      Remarks,
      room_Id,
      created_By,
      creation_date,
    ];

    const result = await connection.promise().query(query, values);

    console.log("sitting added successfully");
    res.status(200).send("sitting added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding sitting to database");
  }
});
//get allsitting
app.get("/allsitting", (req, res) => {
  console.log("Retrieving all Sitting information");

  const query = `SELECT * from Sitting_mast`;

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
//update sitting
//  app.put('/sittingupdate', (req, res) => {
//   var d1 = new Date();
//   // console.log("lastupdatedDateTime", d1);
//   // Extract data from the request body and URL parameter
//   const { sitting_ref_no,sitting_area,remarks,id} = req.body;
// // const id =req.params.id
//   // Construct the update object with empty values for unspecified fields
//   const updateObject = {
//     Sitting_ref_no: sitting_ref_no || '',
//     Sitting_area: sitting_area || '',
//     Remarks: remarks || '',
//     last_updated_date: d1,

//   };
//check code
app.put("/sittingupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body
  const {
    sitting_ref_no,
    sitting_area,
    last_updated_by,
    remarks,
    room_id,
    id,
  } = req.body;
  // const Id = req.body.id;
  console.log("sitting id update hit ", req.body.id);
  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    Sitting_ref_no: sitting_ref_no || "",
    Sitting_area: sitting_area || "",
    Remarks: remarks || "",
    room_id: room_id || 0,
    Last_updated_by: last_updated_by || 0,
    last_updated_date: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE Sitting_mast SET ? WHERE Sitting_id = ?",
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
        const message = `Sitting record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `Sitting record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
//post room_mast data
app.post("/roompost", async (req, res) => {
  console.log("post room api hit");

  try {
    // Extract data from the request body
    const { sitting_ref_no, remarks, created_by } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const Sitting_ref_no = sitting_ref_no || "";

    const Remarks = remarks || "";

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO room_mast (sitting_ref_no, remarks, created_by, creation_date)
      VALUES (?, ?, ?, ?)`;

    const values = [Sitting_ref_no, Remarks, created_By, creation_date];

    const result = await connection.promise().query(query, values);

    console.log("room added successfully");
    res.status(200).send("room added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding room to database");
  }
});
//get allroom
app.get("/allroom", (req, res) => {
  console.log("Retrieving all room information");

  const query = `   SELECT r.*, u.user_name AS created_by_name
  FROM room_mast AS r
  LEFT JOIN user_mast AS u ON r.created_by = u.user_id`;

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
//update room _mast
app.put("/roomupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const { sitting_ref_no, remarks, id, Last_updated_by } = req.body;
  // const id = req.pag rams.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    Sitting_ref_no: sitting_ref_no || "",
    // Sitting_area: sitting_area || '',
    Remarks: remarks || "",
    Last_updated_by: Last_updated_by || 0,
    last_updated_date: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE room_mast SET ? WHERE  room_id  = ?",
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
        const message = `room record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `room record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete room _mast
app.delete("/roomdelete/:id", (req, res) => {
  console.log("delete api hit");
  const id = req.params.id;
  console.log("id##", id);
  connection.query(
    "DELETE FROM room_mast WHERE room_id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `room with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `room with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
// 19/7/23 4:52 sitting data by sitting _id
app.get("/sittingdatabyid/:sitting_id", async (req, res) => {
  try {
    const sittingId = req.params.sitting_id;

    // Retrieve the sitting data from the database by sitting_id
    const query = `
      SELECT * FROM Sitting_mast
      WHERE Sitting_id = ?
    `;
    const [result] = await connection.promise().query(query, [sittingId]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Sitting not found" });
    }

    // Extract the sitting data
    const sittingData = result[0];

    // Send the JSON response
    res.status(200).json(sittingData);
  } catch (error) {
    console.error("Error retrieving sitting data from the database:", error);
    res.status(500).send("Error retrieving sitting data from the database");
  }
});
module.exports = app;
