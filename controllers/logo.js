const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
//post logo mast data
const upload4 = multer({ dest: "logo_images/" });
app.post("/postlogodata", upload4.single("image"), async (req, res) => {
  console.log("post logodata API hit");
  try {
    // Extract data from the request body
    const {
      brand_name,
      image_type,
      size,
      size_in_mb,
      created_by,
      last_updated_by,
      last_updated_at,
      remark,
      logocat,
    } = req.body;

    const brandName = brand_name || "";
    const imageType = image_type || "";
    const Size = size || "";
    const sizeINMB = size_in_mb || 0;
    const createdBy = created_by ? parseInt(created_by) : 0;
    const image = req.file ? req.file.filename : null;
    const createdAt = new Date();
    const lastUpdatedBy = last_updated_by ? parseInt(last_updated_by) : 0;
    const logoCat = logocat ? parseInt(logocat) : 0;
    const Remark = remark || "";
    let lastUpdatedAt = last_updated_at || null;

    // Modify lastUpdatedAt if it's an empty string
    if (lastUpdatedAt === "") {
      lastUpdatedAt = null;
    }

    // Insert the new logo data into the logo_mast table
    const insertLogoQuery = `
      INSERT INTO logo_mast (
        brand_name,
        image_type,
        size,
        size_in_mb,
        created_by,
        created_at,
        last_updated_at,
        last_updated_by,
        remarks,
        logo_cat ,
        upload_logo

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const logoValues = [
      brandName,
      imageType,
      Size,
      sizeINMB,
      createdBy,
      createdAt,
      lastUpdatedAt,
      lastUpdatedBy,
      Remark,
      logoCat,
      image,
    ];

    // Execute the insert query for the logo data
    await connection.promise().query(insertLogoQuery, logoValues);

    console.log("logo_mast data added successfully");
    res.status(200).send("logo_mast data added successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error adding logo_mast data to database: " + error.message);
  }
});
app.get("/logo_images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "logo_images", filename);
  res.sendFile(imagePath);
});
app.get("/logodata", async (req, res) => {
  try {
    // Retrieve products from the database
    const query = `
    SELECT lm.*, lcm.cat_name, lcm.id AS cat_id, um.user_name
    FROM logo_mast AS lm
    LEFT JOIN logo_cat_mast AS lcm ON lcm.id = lm.logo_cat
    LEFT JOIN user_mast AS um ON um.user_id = lm.created_by
  `;

    const [products] = await connection.promise().query(query);

    // Create an array to store the product data
    const productData = [];

    // Process each product and add it to the array
    products.forEach((product) => {
      const productObj = {
        logo_id: product.logo_id,
        brand_name: product.brand_name,
        image_type: product.image_type,
        size: product.size,
        remarks: product.remarks,
        created_by: product.created_by,
        user_name: product.user_name,
        created_at: product.created_at,
        last_updated_at: product.last_updated_at,
        last_updated_by: product.last_updated_by,
        cat_id: product.cat_id, // Include the category id in the response
        cat_name: product.cat_name, // Include the category name in the response
      };

      // Add the logo image URL if it exists
      if (product.upload_logo) {
        const imageUrl = `${req.protocol}://${req.get("host")}/logo_images/${
          product.upload_logo
        }`;
        productObj.logo_image = imageUrl;
        productObj.logo_image_download = `${imageUrl}?download=true`;
      } else {
        productObj.logo_image = null;
        productObj.logo_image_download = null;
      }

      productData.push(productObj);
    });

    // Send the product data as JSON response
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error retrieving products from the database:", error);
    res.status(500).send("Error retrieving products from the database");
  }
});
app.get("/getlogodata/:logo_id", async (req, res) => {
  try {
    const logoId = req.params.logo_id;

    // Retrieve the logo, category id, and category name from the database by logo_id
    const query = `
      SELECT lm.*, lcm.id AS cat_id, lcm.cat_name 
      FROM logo_mast AS lm
      LEFT JOIN logo_cat_mast AS lcm ON lcm.id = lm.logo_cat 
      WHERE lm.logo_id = ?
    `;
    const [result] = await connection.promise().query(query, [logoId]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Logo not found" });
    }

    // Extract the logo and category data
    const {
      logo_id,
      brand_name,
      image_type,
      size,
      remarks,
      upload_logo,
      cat_id,
      cat_name,
    } = result[0];

    // Create the JSON response
    const jsonResponse = {
      logo_id,
      brand_name,
      image_type,
      size,
      remarks,
      upload_logo: upload_logo
        ? `${req.protocol}://${req.get("host")}/logo_images/${upload_logo}`
        : null,
      cat_id,
      cat_name,
    };

    // Send the JSON response
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error retrieving logo from the database:", error);
    res.status(500).send("Error retrieving logo from the database");
  }
});

// get logo_mast data by brand_name

app.get("/logodata/:brandName", async (req, res) => {
  try {
    const brandName = req.params.brandName;

    // Retrieve logos from the database by brand_name
    const query = ` SELECT lm.*, lcm.id AS cat_id, lcm.cat_name 
    FROM logo_mast AS lm
    LEFT JOIN logo_cat_mast AS lcm ON lcm.id = lm.logo_cat WHERE brand_name = ?`;
    const [logos] = await connection.promise().query(query, [brandName]);

    if (!logos || logos.length === 0) {
      return res
        .status(404)
        .json({ message: "No logos found for the given brand name" });
    }

    // Create an array to store the logo data
    const logoData = [];

    // Process each logo and add it to the array
    logos.forEach((logo) => {
      const logoObj = {
        logo_id: logo.logo_id,
        brand_name: logo.brand_name,
        cat_id: logo.cat_id,
        cat_name: logo.cat_name,
        image_type: logo.image_type,
        size_in_mb: logo.size_in_mb,
        size: logo.size,
        remarks: logo.remarks,
        created_by: logo.created_by,
        created_at: logo.created_at,
        last_updated_at: logo.last_updated_at,
        last_updated_by: logo.last_updated_by,
      };

      // Add the logo image URL if it exists
      if (logo.upload_logo) {
        const imageUrl = `${req.protocol}://${req.get("host")}/logo_images/${
          logo.upload_logo
        }`;
        logoObj.upload_logo = imageUrl; // Set key name as "upload_logo"
        logoObj.logo_image_download = `${imageUrl}?download=true`;
      } else {
        logoObj.upload_logo = null; // Set key name as "upload_logo"
        logoObj.logo_image_download = null;
      }

      logoData.push(logoObj);
    });

    // Send the logo data as JSON response
    res.status(200).json(logoData);
  } catch (error) {
    console.error("Error retrieving logos from the database:", error);
    res.status(500).send("Error retrieving logos from the database");
  }
});
const upload6 = multer({ dest: "logo_images/" });
app.put("/logoupdate", upload6.single("image"), async (req, res) => {
  console.log("PUT /logoupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const {
      id,
      brand_name,
      image_type,
      size,
      Remarks,
      cat_name,
      Last_updated_by,
    } = req.body;

    // Check if brand_name is defined and not empty, otherwise set it to an empty string
    const brandName = brand_name || "";
    const imageType = image_type || "";
    const Size = size || "";
    const Image = req.file ? req.file.filename : null;
    // Check if Last_updated_by is defined and convert it to an integer, otherwise set it to 0
    const lastUpdatedBy = Last_updated_by ? parseInt(Last_updated_by) : 0;
    const catName = cat_name ? parseInt(cat_name) : 0;

    // Retrieve the existing logo from the database
    const getProductQuery = "SELECT * FROM logo_mast WHERE logo_id = ?";
    const [existingLogo] = await connection
      .promise()
      .query(getProductQuery, [id]);

    if (!existingLogo || !existingLogo.length) {
      return res.status(404).send("Logo not found");
    }

    // Update the logo in the database
    const updateQuery =
      // "UPDATE logo_mast SET brand_name = ?, image_type = ?, upload_logo = ?, size = ?, Remarks = ?, logo_cat = ?, Last_updated_by = ?, last_updated_at = ? WHERE logo_id = ?";
      // "UPDATE logo_mast SET brand_name = ?, Remarks = ?, logo_cat = ?, Last_updated_by = ?, last_updated_at = ? WHERE logo_id = ?";
      "UPDATE logo_mast SET brand_name = ?, Remarks = ?, Last_updated_by = ?, last_updated_at = ? WHERE logo_id = ?";
    const updateValues = [
      brandName,
      // imageType,
      // Image,
      // Size,
      Remarks,
      // catName,
      lastUpdatedBy,
      currentDate,
      id,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("Logo updated successfully");
    res.status(200).send("Logo updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the logo in the database: " + error.message);
  }
});

app.put("/logoupdatenew", upload6.single("image"), async (req, res) => {
  console.log("PUT /logoupdate API hit");
  const currentDate = new Date();

  try {
    const { id, brand_name, Remarks, Last_updated_by } = req.body;

    const brandName = brand_name || "";
    const lastUpdatedBy = Last_updated_by ? parseInt(Last_updated_by) : 0;

    const getPreviousBN = "SELECT brand_name FROM logo_mast WHERE logo_id = ?";
    const [getResponse] = await connection
      .promise()
      .query(getPreviousBN, [req.body.id]);
    const finale = getResponse[0].brand_name;

    const selectLogoIdsQuery =
      "SELECT logo_id FROM logo_mast WHERE brand_name = ?";
    const [logoIdsRows] = await connection
      .promise()
      .query(selectLogoIdsQuery, [finale]);
    const logoIds = logoIdsRows.map((row) => row.logo_id);

    const updateQuery =
      "UPDATE logo_mast SET brand_name = ?, Remarks = ?, Last_updated_by = ?, last_updated_at = ? WHERE logo_id IN (?)";
    const updateValues = [
      brandName,
      Remarks,
      lastUpdatedBy,
      currentDate,
      logoIds,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("Logo updated successfully");
    res.status(200).send("Logo updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the logo in the database: " + error.message);
  }
});

app.get("/logodata/:logo_id", async (req, res) => {
  try {
    const logoId = req.params.logo_id;

    // Retrieve the logo from the database by logo_id
    const query = "SELECT * FROM logo_mast WHERE logo_id = ?";
    const [logo] = await connection.promise().query(query, [logoId]);

    if (!logo || !logo.length) {
      return res.status(404).json({ message: "Logo not found" });
    }

    // Extract the logo data
    const logoData = logo[0];

    // Create the JSON response
    const jsonResponse = {
      logo_id: logoData.logo_id,
      brand_name: logoData.brand_name,
      image_type: logoData.image_type,
      size: logoData.size,
      remark: logoData.remarks,
      upload_logo: logoData.upload_logo
        ? `${req.protocol}://${req.get("host")}/logo_images/${
            logoData.upload_logo
          }`
        : null,
    };

    // Send the JSON response
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Error retrieving logo from the database:", error);
    res.status(500).send("Error retrieving logo from the database");
  }
});

// delete logo_mast data by logo_id
app.delete("/logodelete/:id", (req, res) => {
  const id = req.params.id;
  console.log("for logo deleteid##", id);
  connection.query(
    "DELETE FROM logo_mast WHERE logo_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `logo with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `logo with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});

app.delete("/logodeletenew/:brandName", (req, res) => {
  const brandName = req.params.brandName;
  console.log("for logo delete, brand_name:", brandName);
  connection.query(
    "DELETE FROM logo_mast WHERE brand_name = ?",
    [brandName],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Logo with brand_name ${brandName} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Logo with brand_name ${brandName} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
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
