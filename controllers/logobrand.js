const express = require("express");
const app = express.Router();
// const multer = require("multer");

const connection = require("../db");
// post data of logo_cat_mast
app.post("/logocat", async (req, res) => {
  console.log("post logo_cat api hit");

  try {
    // Extract data from the request body
    const { cat_name, remarks, created_by } = req.body;

    // If sitting_ref_no is not defined or is empty, set it to null
    const catName = cat_name || "";
    // const Sitting_area = sitting_area || "";
    const Remarks = remarks || "";

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO logo_cat_mast (cat_name,remark,created_at, created_by)
        VALUES (?, ?, ?,?)`;

    const values = [catName, Remarks, creation_date, created_By];

    const result = await connection.promise().query(query, values);

    console.log("logo_cat added successfully");
    res.status(200).send("logo_cat added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding logo_cat to database");
  }
});
//get all data of logo_cat_mast
app.get("/alllogocat", (req, res) => {
  // console.log("get dept api hit");
  connection.query(`SELECT * from logo_cat_mast`, (err, results) => {
    if (err) {
      // console.error(err);
      res.sendStatus(500);
      return;
    }
    // console.log(results);
    res.send(results);
  });
});
// 18/7/23 get data by logo_cat_id
app.get("/getlogocatbyid", (req, res) => {
  const logocatId = req.body.logo_cat_id;

  const query = `
        SELECT lcm.*, u.user_name AS created_by_name
        FROM logo_cat_mast AS lcm
        LEFT JOIN user_mast AS u ON lcm.created_by  = u.user_id
        WHERE lcm.id = ?
      `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, [logocatId], (err, results) => {
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
//update logo_cat data
app.put("/logocatupdate", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const { cat_name, remark, last_updated_by, id } = req.body;
  // const id = req.pag rams.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    cat_name: cat_name || "",
    last_updated_by: last_updated_by || 0,
    remark: remark || "",
    last_updated_at: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE logo_cat_mast SET ? WHERE id  = ?",
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
        const message = `logo_cat record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `logo_cat record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});
// delete logo_cat data by id
app.delete("/logocatdelete/:id", (req, res) => {
  // console.log("delete api hit");
  const id = req.params.id;
  // console.log("id##",id);
  connection.query(
    "DELETE FROM logo_cat_mast WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        // console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `logo_cat with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `logo_cat with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
module.exports = app;
