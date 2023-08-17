const express = require("express");
const app = express.Router();
const multer = require("multer");

const connection = require("../db");
app.post("/orderreqs", async (req, res) => {
  console.log("POST /orderreqs API hit");
  try {
    const room_id = req.body.room_id;
    const Request_delivered_by = req.body.Request_delivered_by;
    console.log("room_id##", room_id);
    console.log("Request_delivered_by##", Request_delivered_by);

    // Retrieve order requests with additional information from the database for the specified Request_delivered_by
    const query = `
    SELECT
    Order_req_mast.Order_req_id,
    Order_req_mast.user_id,
    user_mast.User_id,
    user_mast.User_name,
    user_mast.image,
    Product_mast.Product_id,
    Product_mast.Product_name,
    Product_mast.Product_image,
    Order_req_mast.order_quantity,
    Sitting_mast.Sitting_id,
    Sitting_mast.Sitting_area,
    Sitting_mast.Sitting_ref_no,
    Order_req_mast.Request_datetime,
    Order_req_mast.Message,
    Order_req_mast.Special_request,
    Order_req_mast.props1,
    Order_req_mast.props2,
    Order_req_mast.props3,
    Order_req_mast.props1Int,
    Order_req_mast.props2Int,
    Order_req_mast.props3Int 
  FROM
    Order_req_mast
  INNER JOIN user_mast ON Order_req_mast.user_id = user_mast.User_id
  INNER JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id
  INNER JOIN Sitting_mast ON Order_req_mast.Sitting_id = Sitting_mast.Sitting_id
  WHERE
    Order_req_mast.Status NOT IN ('complete', 'declined')
    AND (Order_req_mast.room_id = ? OR Order_req_mast.Request_delivered_by = ?);
  
  `;

    const [orderRequests] = await connection
      .promise()
      .query(query, [room_id, Request_delivered_by]);

    if (!orderRequests || orderRequests.length === 0) {
      return res.status(404).json({ message: "No order requests found" });
    }

    // Modify the order requests data to include the user image URL, product image URL, and special request
    const modifiedOrderRequests = orderRequests.map((orderRequest) => {
      const userImage = orderRequest.image
        ? `${req.protocol}://${req.get("host")}/user_images/${
            orderRequest.image
          }`
        : null;
      const productImage = orderRequest.Product_image
        ? `${req.protocol}://${req.get("host")}/product_images/${
            orderRequest.Product_image
          }`
        : null;

      return {
        Order_req_id: orderRequest.Order_req_id,
        User_id: orderRequest.User_id,
        User_name: orderRequest.User_name,
        image: userImage,
        Product_id: orderRequest.Product_id,
        Product_name: orderRequest.Product_name,
        Product_image: productImage,
        Order_quantity: orderRequest.order_quantity,
        Sitting_id: orderRequest.Sitting_id,
        Sitting_area: orderRequest.Sitting_area,
        Sitting_ref_no: orderRequest.Sitting_ref_no,
        Request_datetime: orderRequest.Request_datetime,
        Message: orderRequest.Message,
        props1: orderRequest.props1,
        props2: orderRequest.props2,
        props3: orderRequest.props3,
        props1Int: orderRequest.props1Int,
        props2Int: orderRequest.props2Int,
        props3Int: orderRequest.props3Int,
        Special_request: orderRequest.Special_request, // Add the special_req field
      };
    });

    console.log("modifiedOrderRequests##", modifiedOrderRequests);

    res.status(200).json(modifiedOrderRequests);
  } catch (error) {
    console.error("Error retrieving order requests from the database:", error);
    res
      .status(500)
      .json({ message: "Error retrieving order requests from the database" });
  }
});

// code gor get previous order list by user_id31/7/23 5:28
app.get("/orderreqshistory/:user_id", async (req, res) => {
  console.log("POST /orderreqs API hit");
  try {
    const user_id = req.params.user_id; // Get the user_id from the request body

    // Calculate the datetime 48 hours ago from the current datetime
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Retrieve order requests with additional information from the database for the specified user_id
    const query = `
      SELECT
        Order_req_mast.Order_req_id,
        Order_req_mast.user_id,
        user_mast.User_id,
        user_mast.User_name,
        user_mast.image,
        Product_mast.Product_id,
        Product_mast.Product_name,
        Product_mast.Product_image,
        Order_req_mast.order_quantity,
        Sitting_mast.Sitting_id,
        Sitting_mast.Sitting_area,
        Sitting_mast.Sitting_ref_no,
        Order_req_mast.Request_datetime,
        Order_req_mast.Message,
        Order_req_mast.Special_request
      FROM
        Order_req_mast
        INNER JOIN user_mast ON Order_req_mast.user_id = user_mast.User_id
        INNER JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id
        INNER JOIN Sitting_mast ON Order_req_mast.Sitting_id = Sitting_mast.Sitting_id
      WHERE
        Order_req_mast.user_id = ? /* Filter by user_id */
        AND Order_req_mast.Request_datetime >= ? /* Filter by request datetime within the last 48 hours */
      ORDER BY Order_req_mast.Request_datetime DESC
      LIMIT 3
    `;

    const [orderRequests] = await connection
      .promise()
      .query(query, [user_id, fortyEightHoursAgo]);

    if (!orderRequests || orderRequests.length === 0) {
      return res.status(404).json({ message: "No order requests found" });
    }

    // Modify the order requests data to include the user image URL, product image URL, and special request
    const modifiedOrderRequests = orderRequests.map((orderRequest) => {
      const userImage = orderRequest.image
        ? `${req.protocol}://${req.get("host")}/user_images/${
            orderRequest.image
          }`
        : null;
      const productImage = orderRequest.Product_image
        ? `${req.protocol}://${req.get("host")}/product_images/${
            orderRequest.Product_image
          }`
        : null;

      return {
        Order_req_id: orderRequest.Order_req_id,
        User_id: orderRequest.User_id,
        User_name: orderRequest.User_name,
        image: userImage,
        Product_id: orderRequest.Product_id,
        Product_name: orderRequest.Product_name,
        Product_image: productImage,
        Order_quantity: orderRequest.order_quantity,
        Sitting_id: orderRequest.Sitting_id,
        Sitting_area: orderRequest.Sitting_area,
        Sitting_ref_no: orderRequest.Sitting_ref_no,
        Request_datetime: orderRequest.Request_datetime,
        Message: orderRequest.Message,
        Special_request: orderRequest.Special_request, // Add the special_req field
      };
    });

    console.log("modifiedOrderRequests##", modifiedOrderRequests);

    res.status(200).json(modifiedOrderRequests);
  } catch (error) {
    console.error("Error retrieving order requests from the database:", error);
    res
      .status(500)
      .json({ message: "Error retrieving order requests from the database" });
  }
});
app.get("/orderrequest", async (req, res) => {
  console.log("GET /orderrequest API hit");
  try {
    const orderId = req.body.orderId;

    // Retrieve the order request with additional information from the database
    const query = `
      SELECT
        Order_req_mast.*,
        Product_mast.Product_name,
        user_mast.User_name,
        user_mast_delivered.User_name AS Request_delivered_by_name
      FROM
        Order_req_mast
        INNER JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id
        INNER JOIN user_mast ON Order_req_mast.user_id = user_mast.user_id
        LEFT JOIN user_mast AS user_mast_delivered ON Order_req_mast.Request_delivered_by = user_mast_delivered.user_id
      WHERE
        Order_req_mast.order_req_id = ?
    `;
    const [orderRequest] = await connection.promise().query(query, [orderId]);

    if (!orderRequest || !orderRequest.length) {
      return res.status(404).send("Order request not found");
    }

    console.log("Order request retrieved successfully");
    res.status(200).json(orderRequest[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error retrieving order request from the database: " + error.message
      );
  }
});
app.get("/allorderrequest", async (req, res) => {
  console.log("GET /allorderrequest API hit");
  try {
    // Retrieve all order requests with additional information from the database
    const query = `
      SELECT
        Order_req_mast.user_id,
        user_mast.User_id,
        user_mast.User_name,
        Product_mast.Product_name,
        Product_mast.Product_image,
        Order_req_mast.order_quantity,
        Sitting_mast.Sitting_id,
        Sitting_mast.Sitting_area,
        Sitting_mast.Sitting_ref_no,
        Order_req_mast.Request_datetime,
        Order_req_mast.Message,
        Order_req_mast.Order_req_id
      FROM
        Order_req_mast
        INNER JOIN user_mast ON Order_req_mast.user_id = user_mast.user_id
        INNER JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id
        INNER JOIN Sitting_mast ON Order_req_mast.Sitting_id = Sitting_mast.Sitting_id
      WHERE Order_req_mast.status = 'pending'
    `;

    const [orderRequests] = await connection.promise().query(query);

    if (!orderRequests || !orderRequests.length) {
      return res.status(404).json({ message: "No order requests found" });
    }

    // Modify the order requests data to include HTML tags for all fields
    const modifiedOrderRequests = orderRequests.map((orderRequest) => {
      return {
        User_id: ` ${orderRequest.User_id}`,
        User_name: ` ${orderRequest.User_name}`,
        Product_name: ` ${orderRequest.Product_name}`,
        Product_image: `${req.protocol}://${req.get("host")}/product_images/${
          orderRequest.Product_image
        }`,
        Order_quantity: ` ${orderRequest.order_quantity}`,
        Sitting_id: ` ${orderRequest.Sitting_id}`,
        Sitting_area: ` ${orderRequest.Sitting_area}`,
        Sitting_ref_no: ` ${orderRequest.Sitting_ref_no}`,
        Request_datetime: ` ${orderRequest.Request_datetime}`,
        Message: ` ${orderRequest.Message}`,
        Order_req_id: ` ${orderRequest.Order_req_id}`,
      };
    });

    console.log("modifiedOrderRequests##", modifiedOrderRequests);

    // Send the order requests as JSON response
    res.status(200).json(modifiedOrderRequests);
  } catch (error) {
    console.error("Error retrieving order requests from the database:", error);
    res
      .status(500)
      .json({ message: "Error retrieving order requests from the database" });
  }
});
const path = require("path");

app.use(
  "/product_images",
  express.static(path.join(__dirname, "product_images"))
);
app.get("/productdata", async (req, res) => {
  try {
    // Retrieve products from the database
    const query = "SELECT * FROM Product_mast";
    const [products] = await connection.promise().query(query);

    // Create an array to store the product data
    const productData = [];

    // Process each product and add it to the array
    products.forEach((product) => {
      const productObj = {
        // Product_id: product.Product_id,
        // Product_image: product.Product_image
        //   ? `${req.protocol}://${req.get('host')}/product_images/${product.Product_image}`
        //   : null,
        Product_id: product.Product_id,
        Product_name: product.Product_name,
        Product_type: product.Product_type,
        Product_image: product.Product_image
          ? `${req.protocol}://${req.get("host")}/product_images/${
              product.Product_image
            }`
          : null,
        Duration: product.Duration,
        Stock_qty: product.Stock_qty,
        Unit: product.Unit,
        Opening_stock: product.Opening_stock,
        Opening_stock_date: product.Opening_stock_date,
        Remarks: product.Remarks,
        Creation_date: product.creation_date,
        Created_by: product.Created_by,
        Last_updated_by: product.Last_updated_by,
        Last_updated_date: product.Last_updated_date,
        props1: product.props1,
        props2: product.props2,
        props3: product.props3,
      };

      productData.push(productObj);
    });

    // Send the product data as JSON response
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error retrieving products from the database:", error);
    res.status(500).send("Error retrieving products from the database");
  }
});
app.get("/userorderrequest", async (req, res) => {
  console.log("GET /userorderrequest API hit");
  try {
    const userId = req.body.userId;

    // Retrieve the order requests with additional information from the database
    const query = `
      SELECT
        Order_req_mast.*,
        Product_mast.Product_name,
        Product_mast.Product_id,
        user_mast.User_name,
        user_mast_delivered.User_name AS Request_delivered_by_name
      FROM
        Order_req_mast
        INNER JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id
        INNER JOIN user_mast ON Order_req_mast.user_id = user_mast.user_id
        LEFT JOIN user_mast AS user_mast_delivered ON Order_req_mast.Request_delivered_by = user_mast_delivered.user_id
      WHERE
        Order_req_mast.user_id = ?
    `;
    const [orderRequests] = await connection.promise().query(query, [userId]);

    if (!orderRequests || !orderRequests.length) {
      return res.status(404).send("Order requests not found for the user");
    }

    console.log("Order requests retrieved successfully");
    res.status(200).json(orderRequests);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error retrieving order requests from the database: " + error.message
      );
  }
});
app.put("/orderrequest", async (req, res) => {
  const order_req_id = req.body.order_req_id;
  console.log("update Order_req", order_req_id);
  const currentDateTime = new Date();
  console.log("req.body==", req.body);

  try {
    const {
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      message,
      remarks,
    } = req.body;

    // Validate product_id
    const product_id = req.body.product_id;
    if (!product_id) {
      res.status(400).send("Invalid product ID");
      return;
    }

    // Update the order request in the database
    const query = `
      UPDATE Order_req_mast
      SET
        Product_id = ?,
        Order_quantity = ?,
        Special_request = ?,
        User_id = ?,
        Sitting_id = ?,
        Status = ?,
        Request_delivered_by = ?,
        Delivered_datetime = ?, -- Update the Delivered_datetime field
        Message = ?,
        Remarks = ?,
        Last_updated_date = ? -- Update the Last_updated_date field
      WHERE
      order_req_id = ?
    `;
    const values = [
      product_id,
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      currentDateTime,
      message,
      remarks,
      currentDateTime, // Assign the current date and time to Last_updated_date field
      order_req_id,
    ];

    const [updateResult] = await connection.promise().query(query, values);

    if (updateResult.affectedRows === 0) {
      res.status(404).send("Order request not found");
      return;
    }

    console.log("Order request updated successfully");
    res.status(200).send("Order request updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating order request in the database: " + error.message);
  }
});

// delete oder req
// delete user
app.delete("/orderreqdelete", (req, res) => {
  const id = req.body.id;

  connection.query(
    'DELETE FROM Order_req_mast WHERE Order_req_id = ? AND status = "pending"',
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Order request with ID ${id} not found or is not in "pending" status`;
        res.status(404).send(message);
        return;
      }
      const message = `Order request with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
//delete order req
app.delete("/orderreqdelete", (req, res) => {
  const id = req.body.id;

  connection.query(
    'DELETE FROM Order_req_mast WHERE Order_req_id = ? AND status = "pending"',
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Order request with ID ${id} not found or is not in "pending" status`;
        res.status(404).send(message);
        return;
      }
      const message = `Order request with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});
const upload = multer({ dest: "product_images/" });

app.post("/product", upload.single("Product_image"), async (req, res) => {
  console.log("post product api hit");
  var d1 = new Date();
  try {
    // Extract data from the request body
    const {
      Product_name,
      Product_type,
      Duration,
      Stock_qty,
      Unit,
      Opening_stock,
      Opening_stock_date,
      Remarks,
      created_by,
      props1,
      props2,
      props3,
      Product_image,
    } = req.body;

    console.log("product req.body", req.body);

    // Check if Product_name is defined and not empty, otherwise set it to an empty string
    const productName = Product_name || "";
    const Props1 = props1 || null;
    const Props2 = props2 || null;
    const Props3 = props3 || null;

    // Check if created_by is defined and convert it to an integer, otherwise set it to 0
    const createdBy = created_by ? parseInt(created_by) : 0;

    // Retrieve the uploaded file
    const productImage = req.file ? req.file.filename : null;

    // Insert the new product into the database
    const query = `INSERT INTO Product_mast (Product_name, Product_type, Product_image, Duration, Stock_qty, Unit, Opening_stock, Opening_stock_date, Remarks, created_by,creation_date,props1,props2,props3)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`;

    const values = [
      productName,
      Product_type,
      productImage,
      Duration,
      Stock_qty,
      Unit,
      Opening_stock,
      Opening_stock_date,
      Remarks,
      createdBy,
      d1,
      Props1,
      Props2,
      Props3,
    ];

    const result = await connection.promise().query(query, values);

    console.log("Product added successfully");
    res.status(200).send("Product added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding product to database: " + error.message);
  }
});
// update product by id 10/6/23
app.put("/productupdate", upload.single("Product_image"), async (req, res) => {
  console.log("PUT /productupdate API hit");
  const currentDate = new Date();

  try {
    // Extract data from the request body
    const {
      id,
      Product_name,
      Product_type,
      Duration,
      Stock_qty,
      Unit,
      Opening_stock,
      Remarks,
      Last_updated_by,
      Product_image,
      props1,
      props2,
      props3,
    } = req.body;

    console.log("product req.body", req.body);

    // Check if Product_name is defined and not empty, otherwise set it to an empty string
    const productName = Product_name || "";
    const productImage = req.file ? req.file.filename : null;
    // Check if Last_updated_by is defined and convert it to an integer, otherwise set it to 0
    const lastUpdatedBy = Last_updated_by ? parseInt(Last_updated_by) : 0;

    // Retrieve the existing product from the database
    const getProductQuery = "SELECT * FROM Product_mast WHERE Product_id = ?";
    const [existingProduct] = await connection
      .promise()
      .query(getProductQuery, [id]);

    if (!existingProduct || !existingProduct.length) {
      return res.status(404).send("Product not found");
    }

    // Determine the new product image
    // let updatedProductImage = existingProduct[0].Product_image;
    // if (req.file) {
    //   updatedProductImage = req.file.filename;
    // }

    // Update the product in the database
    const updateQuery =
      "UPDATE Product_mast SET Product_name = ?, Product_type = ?, Product_image = ?, Duration = ?, Stock_qty = ?, Unit = ?, Opening_stock = ?, Remarks = ?, Last_updated_by = ?, Last_updated_date = ?,props1=?,props2=?,props3=? WHERE Product_id = ?";
    const updateValues = [
      productName,
      Product_type,
      productImage,
      // updatedProductImage,
      Duration,
      Stock_qty,
      Unit,
      Opening_stock,
      Remarks,
      lastUpdatedBy,
      currentDate,
      props1,
      props2,
      props3,
      id,
    ];

    await connection.promise().query(updateQuery, updateValues);

    console.log("Product updated successfully");
    res.status(200).send("Product updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating the product in the database: " + error.message);
  }
});
app.delete("/productdelete/:id", (req, res) => {
  const id = req.params.id;
  console.log("for product deleteid##", id);
  connection.query(
    "DELETE FROM Product_mast WHERE Product_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Product with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Product with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});

// post oder delivery_madt data
app.post("/orderdelivery", async (req, res) => {
  console.log("POST /orderdelivery API hit");

  try {
    const {
      order_req_id,
      product_name,
      order_quantity,
      special_request,
      sitting_name,
      sitting_area,
      request_datetime,
      status,
      request_delivered_by,
      delivered_datetime,
      message,
    } = req.body;

    // Insert the order delivery into the database
    const query = `
      INSERT INTO Order_delivery_mast (
        Order_req_id,
        Product_name,
        Order_quantity,
        Special_request,
        Sitting_name,
        Sitting_area,
        Request_datetime,
        Status,
        Request_delivered_by,
        Delivered_datetime,
        Message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      order_req_id,
      product_name,
      order_quantity,
      special_request,
      sitting_name,
      sitting_area,
      request_datetime,
      status,
      request_delivered_by,
      delivered_datetime,
      message,
    ];

    await connection.promise().query(query, values);

    console.log("Order delivery inserted successfully");
    res.status(200).send("Order delivery inserted successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error inserting order delivery into the database: " + error.message
      );
  }
});
// get all data of order_deliver_mast
app.get("/allorderdelivery", async (req, res) => {
  console.log("GET /orderdelivery API hit");
  const orderId = req.params.id;

  try {
    // Retrieve the order delivery from the database
    const query = `
      SELECT *
      FROM Order_delivery_mast
      
    `;
    const [rows] = await connection.promise().query(query, [orderId]);

    if (rows.length === 0) {
      const message = `Order delivery with ID ${orderId} not found`;
      res.status(404).send(message);
      return;
    }

    const orderDelivery = rows[0];
    console.log("Order delivery retrieved successfully");
    res.status(200).json(orderDelivery);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Error retrieving order delivery from the database: " + error.message
      );
  }
});
app.post("/transreq", async (req, res) => {
  console.log("post transfer request API hit");

  try {
    // Extract data from the request body
    const { from_id, to_id, reason, order_req_id } = req.body;
    console.log("transreq body data", req.body);
    const From_id = from_id || 0;
    const To_id = to_id || 0;
    const Reason = reason || "";
    const Order_req_id = order_req_id || 0;

    // Insert the new user into the database using a parameterized query
    const query = `INSERT INTO Transfer_request (From_id, To_id, Reason, order_req_id)
      VALUES (?, ?, ?, ?)`;

    const values = [From_id, To_id, Reason, Order_req_id];

    const result = await connection.promise().query(query, values);

    console.log("Transfer request added successfully");
    res.status(200).send("Transfer request added successfully");

    const updateQuery = `
      UPDATE Order_req_mast
      SET Request_delivered_by = ?
      WHERE Order_req_id = ?
    `;

    const updateValues = [To_id, Order_req_id];

    await connection.promise().query(updateQuery, updateValues);

    console.log("Order request updated successfully");
    res.status(200).send("Order request updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding Transfer request to database");
  }
});
app.get("/alltransreq", (req, res) => {
  console.log("Retrieving all transfer request information");

  const query = `
        SELECT tr.*, pm.Product_name, sm.sitting_area, u.user_name AS request_transfered_by, u2.user_name AS transfer_to, orm.Order_quantity, u2.user_name AS requested_by
        FROM Transfer_request AS tr
        LEFT JOIN user_mast AS u ON u.user_id = tr.from_id
        LEFT JOIN user_mast AS u2 ON u2.user_id = tr.To_id
        LEFT JOIN Order_req_mast AS orm ON orm.Order_req_id = tr.order_req_id
        LEFT JOIN user_mast AS u3 ON orm.User_id = u3.user_id
        LEFT JOIN Product_mast AS pm ON pm.Product_id = orm.Product_id
        LEFT JOIN Sitting_mast AS sm ON sm.sitting_id = orm.Sitting_id
      `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.json({ data }); // Send the data back to the client as JSON
  });
});
app.get("/productdata", async (req, res) => {
  try {
    // Retrieve products from the database
    const query = "SELECT * FROM Product_mast";
    const [products] = await connection.promise().query(query);

    // Create the HTML string with the products and images
    let html = "<html><body>";
    products.forEach((product) => {
      if (product.Product_image) {
        const imageUrl = `${req.protocol}://${req.get("host")}/upload/${
          product.Product_image
        }`;
        html += `<div><img src="${imageUrl}" alt="Product Image" width="100" height="100"></div>`;
      } else {
        html += "<div>No image available</div>";
      }
      html += `<div>${product.Product_name}</div>`;
      html += `<div>${product.Product_description}</div>`;
      html += `<div>${product.Price}</div>`;
      html += "<hr>";
    });
    html += "</body></html>";

    // Send the HTML response
    res.status(200).send(html);
  } catch (error) {
    console.error("Error retrieving products from the database:", error);
    res.status(500).send("Error retrieving products from the database");
  }
});
// code 22/6/23 post order request data
app.post("/ordereq", async (req, res) => {
  console.log("post order req api hit");
  var d1 = new Date();
  try {
    // Extract data from the request body
    const {
      product_id,
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      delivered_datetime,
      message,
      remarks,
      created_by,
      room_id,
      props1,
      props2,
      props3,
      props1Int,
      props2Int,
      props3Int,
    } = req.body;

    console.log("orderreq req.body", req.body);

    const Product_id = product_id || "";
    const Order_quantity = order_quantity || "";
    const Special_request = special_request || "";
    const Props1 = props1 || null;
    const Props2 = props2 || null;
    const Props3 = props3 || null;
    const props1int = props1Int || 0;
    const props2int = props2Int || 0;
    const props3int = props3Int || 0;

    const User_id = user_id ? parseInt(user_id) : 0;
    const Sitting_id = sitting_id ? parseInt(sitting_id) : 0;
    const Room_id = room_id ? parseInt(room_id) : 0;

    // const Request_datetime = d1; // Assuming you want to use the current datetime
    const Status = status || "pending";
    const Request_delivered_by = request_delivered_by
      ? parseInt(request_delivered_by)
      : 0;

    // Convert the delivered_datetime string to a Date object or set it to null
    const Delivered_datetime = delivered_datetime
      ? new Date(delivered_datetime)
      : null;

    const Message = message || "";
    const Remarks = remarks || "";
    const Creation_date = d1; // Assuming you want to use the current datetime
    const Created_by = created_by ? parseInt(created_by) : 0;

    const Request_datetime = new Date();
    Request_datetime.setHours(Request_datetime.getHours() + 5);
    Request_datetime.setMinutes(Request_datetime.getMinutes() + 30);

    const query = `INSERT INTO Order_req_mast (Product_id, Order_quantity, Special_request, User_id, Sitting_id, Request_datetime, Status, Request_delivered_by, Delivered_datetime, Message, Remarks, Creation_date, Created_by, room_id,props1,props2,props3,props1Int,props2Int,props3Int   )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)`;

    const values = [
      Product_id,
      Order_quantity,
      Special_request,
      User_id,
      Sitting_id,
      Request_datetime,
      Status,
      Request_delivered_by,
      Delivered_datetime,
      Message,
      Remarks,
      Creation_date,
      Created_by,
      Room_id,
      Props1,
      Props2,
      Props3,
      props1int,
      props2int,
      props3int,
    ];
    console.log("values", values);
    const result = await connection.promise().query(query, values);

    console.log("Order request added successfully");
    res.status(200).send("Order request added successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error adding order request to the database: " + error.message);
  }
});
app.get("/allorderreqdata", (req, res) => {
  console.log("Retrieving all order request information");

  const query = `SELECT Order_req_mast.*, user_mast1.user_name AS delivered_by_name, 
                 user_mast2.user_name AS user_name, Sitting_mast1.Sitting_ref_no,
                 Sitting_mast1.Sitting_area, Product_mast.Product_name 
                 FROM Order_req_mast
                 JOIN user_mast AS user_mast1 ON Order_req_mast.Request_delivered_by = user_mast1.user_id
                 JOIN user_mast AS user_mast2 ON Order_req_mast.User_id = user_mast2.user_id
                 JOIN Sitting_mast AS Sitting_mast1 ON Order_req_mast.Sitting_id = Sitting_mast1.sitting_id
                 JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id`;

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
app.put("/orderrequesttransbyman", async (req, res) => {
  const order_req_id = req.body.order_req_id;
  console.log("update Order_req", order_req_id);
  const currentDateTime = new Date();
  console.log("req.body==", req.body);

  try {
    const {
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      message,
      remarks,
      product_id,
      room_id,
      props1,
      props2,
      props3,
    } = req.body;

    // Update the order request in the database
    const query = `
      UPDATE Order_req_mast
      SET
        Product_id = ?,
        Order_quantity = ?,
        Special_request = ?,
        User_id = ?,
        Sitting_id = ?,
        Status = ?,
        room_id=?
        Request_delivered_by = ?,
        Delivered_datetime = ?, -- Update the Delivered_datetime field
        Message = ?,
        Remarks = ?,
        Last_updated_date = ? -- Update the Last_updated_date field
        props1value=?,
        props2value,
        props3value  
      WHERE
        order_req_id = ?
    `;
    const values = [
      product_id,
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      room_id,
      request_delivered_by,
      currentDateTime,
      message,
      remarks,
      currentDateTime, // Assign the current date and time to Last_updated_date field
      props1,
      props2,
      props3,
      order_req_id,
    ];

    const [updateResult] = await connection.promise().query(query, values);

    if (updateResult.affectedRows === 0) {
      res.status(404).send("Order request not found");
      return;
    }

    console.log("Order request updated successfully");
    res.status(200).send("Order request updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating order request in the database: " + error.message);
  }
});
// ststus update by manager
app.put("/statusupdatebymanager", async (req, res) => {
  // const order_req_id = req.body.order_req_id;
  // console.log("update Order_req", order_req_id);
  const currentDateTime = new Date();
  console.log("req.body==", req.body);

  try {
    const {
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      message,
      remarks,
      order_req_id,
      product_id,
    } = req.body;

    // Validate product_id
    // const product_id = req.body.product_id;
    // if (!product_id) {
    //   res.status(400).send("Invalid product ID");
    //   return;
    // }

    // Update the order request in the database
    const query = `
      UPDATE Order_req_mast
      SET
        Product_id = ?,
        Order_quantity = ?,
        Special_request = ?,
        User_id = ?,
        Sitting_id = ?,
        Status = ?,
        Request_delivered_by = ?,
        Delivered_datetime = ?, -- Update the Delivered_datetime field
        Message = ?,
        Remarks = ?,
        Last_updated_date = ? -- Update the Last_updated_date field
      WHERE
      order_req_id = ?
    `;
    const values = [
      product_id,
      order_quantity,
      special_request,
      user_id,
      sitting_id,
      status,
      request_delivered_by,
      currentDateTime,
      message,
      remarks,
      currentDateTime, // Assign the current date and time to Last_updated_date field
      order_req_id,
    ];

    const [updateResult] = await connection.promise().query(query, values);

    if (updateResult.affectedRows === 0) {
      res.status(404).send("Order request not found");
      return;
    }

    console.log("Order request updated successfully");
    res.status(200).send("Order request updated successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error updating order request in the database: " + error.message);
  }
});
module.exports = app;
