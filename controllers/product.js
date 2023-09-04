const express = require("express");
const app = express.Router();
const multer = require("multer");
const connection = require("../db");
const admin = require("firebase-admin");

const serviceAccount = require("./browser-notify-b7b37-firebase-adminsdk-e58t5-118e564ed9.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/notification", async (req, res) => {
  const { title, body } = req.body;

  const tokens = [];

  try {
    await Promise.all(
      tokens.map(async (token) => {
        await admin.messaging().send({
          token,
          notification: {
            title,
            body,
          },
        });
      })
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
});

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

    // console.log("modifiedOrderRequests##", modifiedOrderRequests);

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

    // console.log("modifiedOrderRequests##", modifiedOrderRequests);

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
    user_mast.dept_id,
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
  WHERE Order_req_mast.status = 'pending';
  
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
        dept_id: ` ${orderRequest.dept_id}`,
      };
    });

    // console.log("modifiedOrderRequests##", modifiedOrderRequests);

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

//18/8/23
// app.get("/productdata", async (req, res) => {
//   try {
//     // Retrieve products from the database
//     const query = "SELECT * FROM Product_mast";
//     const [products] = await connection.promise().query(query);

//     // Create an array to store the product data
//     const productData = [];

//     products.forEach((product) => {
//       // Construct full image URL
//       const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
//         product.Product_image
//       }`;

//       // Create an object for each product
//       const productObj = {
//         Product_id: product.Product_id,
//         Product_name: product.Product_name,
//         Product_type: product.Product_type,
//         Duration: product.Duration,
//         Stock_qty: product.Stock_qty,
//         Unit: product.Unit,
//         Opening_stock: product.Opening_stock,
//         Opening_stock_date: product.Opening_stock_date,
//         Remarks: product.Remarks,
//         Creation_date: product.creation_date,
//         Created_by: product.Created_by,
//         Last_updated_by: product.Last_updated_by,
//         Last_updated_date: product.Last_updated_date,
//         props1: product.props1,
//         props2: product.props2,
//         props3: product.props3,
//         Product_image_url: imageUrl,
//         Product_image_download_url: imageUrl, // This can be modified for downloadable URL
//       };

//       productData.push(productObj);
//     });

//     // Send the product data as JSON response
//     res.status(200).json(productData);
//   } catch (error) {
//     console.error("Error retrieving products from the database:", error);
//     res.status(500).send("Error retrieving products from the database");
//   }
// });
//5:31 check productdata code in html
// app.get("/productdata", async (req, res) => {
//   try {
//     // Retrieve products from the database
//     const query = "SELECT * FROM Product_mast";
//     const [products] = await connection.promise().query(query);

//     // Create the HTML response
//     let html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Product Data</title>
//         <style>
//           /* Add your custom CSS styles here */
//           body {
//             font-family: Arial, sans-serif;
//           }
//           .product {
//             border: 1px solid #ccc;
//             padding: 10px;
//             margin: 10px;
//           }
//           .product img {
//             max-width: 100px;
//             max-height: 100px;
//           }
//         </style>
//       </head>
//       <body>
//         <h1>Product Data</h1>
//     `;

//     products.forEach((product) => {
//       // Construct full image URL
//       const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
//         product.Product_image
//       }`;

//       // Construct downloadable URL for the image
//       const downloadUrl = `${req.protocol}://${req.get(
//         "host"
//       )}/product_images/${product.Product_image}`;

//       html += `
//         <div class="product">
//           <h2>Product Name: ${product.Product_name}</h2>
//           <p>Product Type: ${product.Product_type}</p>
//           <p>Duration: ${product.Duration}</p>

//             <img src="${imageUrl}" alt="Product Image" width="100" height="100">
//           </a>
//         </div>
//       `;
//     });

//     html += `
//       </body>
//       </html>
//     `;

//     // Set the response content type to HTML
//     res.setHeader("Content-Type", "text/html");

//     // Send the HTML response
//     res.status(200).send(html);
//   } catch (error) {
//     console.error("Error retrieving products from the database:", error);
//     res.status(500).send("Error retrieving products from the database");
//   }
// });
// 6:00 product data with image view json formate data
// app.get("/productdata", async (req, res) => {
//   try {
//     // Retrieve products from the database
//     const query = "SELECT * FROM Product_mast";
//     const [products] = await connection.promise().query(query);

//     // Create an array to store the product data
//     const productData = [];

//     products.forEach((product) => {
//       // Construct full image URL
//       const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
//         product.Product_image
//       }`;

//       // Construct downloadable URL for the image
//       const downloadUrl = `${req.protocol}://${req.get(
//         "host"
//       )}/product_images/${product.Product_image}`;

//       // Create an object for each product
//       const productObj = {
//         Product_id: product.Product_id,
//         Product_name: product.Product_name,
//         Product_type: product.Product_type,
//         Duration: product.Duration,
//         Stock_qty: product.Stock_qty,
//         Unit: product.Unit,
//         Opening_stock: product.Opening_stock,
//         Opening_stock_date: product.Opening_stock_date,
//         Remarks: product.Remarks,
//         Creation_date: product.creation_date,
//         Created_by: product.Created_by,
//         Last_updated_by: product.Last_updated_by,
//         Last_updated_date: product.Last_updated_date,
//         props1: product.props1,
//         props2: product.props2,
//         props3: product.props3,
//         Product_image_url: imageUrl,
//         Product_image_download_url: downloadUrl,
//       };

//       productData.push(productObj);
//     });

//     // Send the product data as JSON response
//     res.status(200).json(productData);
//   } catch (error) {
//     console.error("Error retrieving products from the database:", error);
//     res.status(500).send("Error retrieving products from the database");
//   }
// });
// 2/9/23 check code_ working code
// app.get("/productdata", async (req, res) => {
//   try {
//     // Retrieve products with their associated properties (or null)
//     const query = `
//       SELECT
//         p.Product_id,
//         p.Product_name,
//         p.Product_type,
//         p.Duration,
//         p.Stock_qty,
//         p.Unit,
//         p.Opening_stock,
//         p.Opening_stock_date,
//         p.Remarks,
//         p.Creation_date,
//         p.Created_by,
//         p.Last_updated_by,
//         p.Last_updated_date,
//         COALESCE(GROUP_CONCAT(pp.prop_name SEPARATOR ', '), NULL) AS Product_Prop
//       FROM Product_mast AS p
//       LEFT JOIN product_props_mast AS pp
//       ON p.Product_id = pp.product_id
//       GROUP BY p.Product_id
//     `;
//     const [productsWithProperties] = await connection.promise().query(query);

//     // Create an array to store the product data
//     const productData = productsWithProperties.map((product) => {
//       // Construct full image URL
//       const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
//         product.Product_image
//       }`;

//       // Construct downloadable URL for the image
//       const downloadUrl = `${req.protocol}://${req.get(
//         "host"
//       )}/product_images/${product.Product_image}`;

//       return {
//         Product_id: product.Product_id,
//         Product_name: product.Product_name,
//         Product_type: product.Product_type,
//         Duration: product.Duration,
//         Stock_qty: product.Stock_qty,
//         Unit: product.Unit,
//         Opening_stock: product.Opening_stock,
//         Opening_stock_date: product.Opening_stock_date,
//         Remarks: product.Remarks,
//         Creation_date: product.Creation_date,
//         Created_by: product.Created_by,
//         Last_updated_by: product.Last_updated_by,
//         Last_updated_date: product.Last_updated_date,
//         Product_Prop: product.Product_Prop, // Comma-separated list of prop_name values
//         Product_image_url: imageUrl,
//         Product_image_download_url: downloadUrl,
//       };
//     });

//     // Send the product data as JSON response
//     res.status(200).json(productData);
//   } catch (error) {
//     console.error("Error retrieving products from the database:", error);
//     res.status(500).send("Error retrieving products from the database");
//   }
// });
app.get("/productdata", async (req, res) => {
  try {
    // Retrieve products with their associated properties (or null)
    const query = `
    SELECT
    p.Product_id,
    p.Product_name,
    p.Product_type,
    p.Duration,
    p.Stock_qty,
    p.Unit,
    p.Opening_stock,
    p.Opening_stock_date,
    p.Remarks,
    p.Creation_date,
    p.Created_by,
    p.Last_updated_by,
    p.Last_updated_date,
    JSON_ARRAYAGG(JSON_OBJECT('id', pp.id, 'type_id', pp.type_id, 'prop_name', pp.prop_name)) AS Product_Prop,
    p.Product_image
FROM Product_mast AS p
LEFT JOIN product_props_mast AS pp
ON p.Product_id = pp.product_id
GROUP BY p.Product_id

    `;
    const [productsWithProperties] = await connection.promise().query(query);

    // Create an array to store the product data
    const productData = productsWithProperties.map((product) => {
      // Construct full image URL
      const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
        product.Product_image
      }`;

      // Construct downloadable URL for the image
      const downloadUrl = `${req.protocol}://${req.get(
        "host"
      )}/product_images/${product.Product_image}?download=true`;

      return {
        Product_id: product.Product_id,
        Product_name: product.Product_name,
        Product_type: product.Product_type,
        Duration: product.Duration,
        Stock_qty: product.Stock_qty,
        Unit: product.Unit,
        Opening_stock: product.Opening_stock,
        Opening_stock_date: product.Opening_stock_date,
        Remarks: product.Remarks,
        Creation_date: product.Creation_date,
        Created_by: product.Created_by,
        Last_updated_by: product.Last_updated_by,
        Last_updated_date: product.Last_updated_date,
        Product_Prop: product.Product_Prop,
        Product_image_url: imageUrl,
        Product_image_download_url: downloadUrl,
      };
    });

    // Send the product data as JSON response
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error retrieving products from the database:", error);
    res.status(500).send("Error retrieving products from the database");
  }
});

//   try {
//     // Retrieve products with their associated properties (or null)
//     const query = `
//       SELECT
//         p.Product_id,
//         p.Product_name,
//         p.Product_type,
//         p.Duration,
//         p.Stock_qty,
//         p.Unit,
//         p.Opening_stock,
//         p.Opening_stock_date,
//         p.Remarks,
//         p.Creation_date,
//         p.Created_by,
//         p.Last_updated_by,
//         p.Last_updated_date,
//         pp.type_id as typeId,
//         COALESCE(GROUP_CONCAT(pp.prop_name SEPARATOR ', '), NULL) AS Product_Prop,
//         p.Product_image AS Product_Image_Name
//       FROM Product_mast AS p
//       LEFT JOIN product_props_mast AS pp
//       ON p.Product_id = pp.product_id
//       GROUP BY p.Product_id
//     `;
//     const [productsWithProperties] = await connection.promise().query(query);

//     // Create an array to store the product data
//     const productData = productsWithProperties.map((product) => {
//       // Construct full image URL
//       const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
//         product.Product_Image_Name
//       }`;

//       // Construct downloadable URL for the image
//       const downloadUrl = imageUrl; // Use the same URL for download

//       return {
//         Product_id: product.Product_id,
//         Product_name: product.Product_name,
//         Product_type: product.Product_type,
//         Duration: product.Duration,
//         Stock_qty: product.Stock_qty,
//         Unit: product.Unit,
//         Opening_stock: product.Opening_stock,
//         Opening_stock_date: product.Opening_stock_date,
//         Remarks: product.Remarks,
//         Creation_date: product.Creation_date,
//         Created_by: product.Created_by,
//         Last_updated_by: product.Last_updated_by,
//         Last_updated_date: product.Last_updated_date,
//         Product_Prop: product.Product_Prop, // Comma-separated list of prop_name values
//         type_id: product.typeId,
//         Product_image_url: imageUrl,
//         Product_image_download_url: downloadUrl, // Use the same URL for download
//       };
//     });

//     // Send the product data as JSON response
//     res.status(200).json(productData);
//   } catch (error) {
//     console.error("Error retrieving products from the database:", error);
//     res.status(500).send("Error retrieving products from the database");
//   }
// });
// get productdata through product_id
app.get("/productdata/:id", async (req, res) => {
  try {
    // Get the product_id from the route parameter
    const product_id = req.params.id;

    // Retrieve products with their associated properties (or null) for the specified product_id
    const query = `
      SELECT
        p.Product_id,
        p.Product_name,
        p.Product_type,
        p.Duration,
        p.Stock_qty,
        p.Unit,
        p.Opening_stock,
        p.Opening_stock_date,
        p.Remarks,
        p.Creation_date,
        p.Created_by,
        p.Last_updated_by,
        p.Last_updated_date,
        JSON_ARRAYAGG(JSON_OBJECT('id', pp.id, 'type_id', pp.type_id, 'prop_name', pp.prop_name)) AS Product_Prop,
        p.Product_image
      FROM Product_mast AS p
      LEFT JOIN product_props_mast AS pp
      ON p.Product_id = pp.product_id
      WHERE p.Product_id = ?
      GROUP BY p.Product_id
    `;

    const [productWithProperties] = await connection
      .promise()
      .query(query, [product_id]);

    if (!productWithProperties.length) {
      // If no product with the specified product_id is found, return a not found response
      return res.status(404).json({ error: "Product not found" });
    }

    // Construct full image URL
    const imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
      productWithProperties[0].Product_image
    }`;

    // Construct downloadable URL for the image
    const downloadUrl = `${req.protocol}://${req.get("host")}/product_images/${
      productWithProperties[0].Product_image
    }?download=true`;

    // Create an object to store the product data
    const productData = {
      Product_id: productWithProperties[0].Product_id,
      Product_name: productWithProperties[0].Product_name,
      Product_type: productWithProperties[0].Product_type,
      Duration: productWithProperties[0].Duration,
      Stock_qty: productWithProperties[0].Stock_qty,
      Unit: productWithProperties[0].Unit,
      Opening_stock: productWithProperties[0].Opening_stock,
      Opening_stock_date: productWithProperties[0].Opening_stock_date,
      Remarks: productWithProperties[0].Remarks,
      Creation_date: productWithProperties[0].Creation_date,
      Created_by: productWithProperties[0].Created_by,
      Last_updated_by: productWithProperties[0].Last_updated_by,
      Last_updated_date: productWithProperties[0].Last_updated_date,
      Product_Prop: productWithProperties[0].Product_Prop, // Comma-separated list of prop_name values
      Product_image_url: imageUrl,
      Product_image_download_url: downloadUrl,
    };

    // Send the product data as JSON response
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error retrieving product from the database:", error);
    res.status(500).send("Error retrieving product from the database");
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
      // props2,
      // props3,
      // props1Int,
      // props2Int,
      // props3Int,
    } = req.body;

    console.log("orderreq req.body", req.body);

    const Product_id = product_id || "";
    const Order_quantity = order_quantity || "";
    const Special_request = special_request || "";
    const Props1 = props1 || null;
    // const Props2 = props2 || null;
    // const Props3 = props3 || null;
    // const props1int = props1Int || 0;
    // const props2int = props2Int || 0;
    // const props3int = props3Int || 0;

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

    const query = `INSERT INTO Order_req_mast (Product_id, Order_quantity, Special_request, User_id, Sitting_id, Request_datetime, Status, Request_delivered_by, Delivered_datetime, Message, Remarks, Creation_date, Created_by, room_id,props1   )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

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
      // Props2,
      // Props3,
      // props1int,
      // props2int,
      // props3int,
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

let timers = {}; // Store to keep track of start times for different order request IDs

app.get("/allorderreqdata", (req, res) => {
  console.log("Retrieving all order request information");

  const query = `
      SELECT 
        Order_req_mast.*,
        user_mast1.user_name AS delivered_by_name,
        user_mast2.user_name AS user_name,
        user_mast3.user_name AS Request_delivered_by_name,
        user_mast2.dept_id AS dept_id,
        Sitting_mast1.Sitting_ref_no,
        Sitting_mast1.Sitting_area,
        Product_mast.Product_name,
        Product_mast.Duration
      FROM Order_req_mast
      JOIN user_mast AS user_mast1 ON Order_req_mast.Request_delivered_by = user_mast1.user_id
      JOIN user_mast AS user_mast2 ON Order_req_mast.User_id = user_mast2.user_id
      JOIN user_mast AS user_mast3 ON Order_req_mast.Request_delivered_by = user_mast3.user_id
      JOIN Sitting_mast AS Sitting_mast1 ON Order_req_mast.Sitting_id = Sitting_mast1.sitting_id
      JOIN Product_mast ON Order_req_mast.Product_id = Product_mast.Product_id;
    `;

  // Send the query to the MySQL database and handle any errors or data retrieved
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    // Calculate the countdown timers based on the "Duration" from the database
    const currentTime = new Date();
    const responseData = data.map((item) => {
      const orderRequestId = item.Order_req_id;

      if (!timers[orderRequestId]) {
        timers[orderRequestId] = {
          startTime: currentTime,
          duration: item.Duration * 60000, // Convert Duration to milliseconds
        };
      }

      const elapsedTime = currentTime - timers[orderRequestId].startTime;
      const remainingTime = timers[orderRequestId].duration - elapsedTime;

      const secondsRemaining = Math.floor(remainingTime / 1000);
      const formattedTimer = Math.max(secondsRemaining, 0); // Ensure the timer is not negative

      return {
        ...item,
        timer: formattedTimer,
      };
    });

    res.send({ data: responseData }); // Send the data back to the client with countdown timers
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
// 31/8/23 product_props_mast Post
// app.post("/propspost", async (req, res) => {
//   console.log("post product props api hit");

//   try {
//     // Extract data from the request body
//     const { product_id, type_id, prop_name, remark, created_by } = req.body;

//     // If dept_name is not defined or is empty, set it to an empty string
//     const productId = product_id || 0;
//     const typeId = type_id || 0;
//     const propName = prop_name || "";

//     // Check if remark is defined and convert to string
//     const remarkValue = remark || "";
//     const created_By = created_by || 0;
//     // const deptId = dept_id || 0;

//     // Get the current date
//     const currentDate = new Date();
//     const creation_date = currentDate.toISOString().split("T")[0]; // Extract only the date part

//     // Check if location_id is defined and convert to integer
//     // const locationIdValue = location_id ? parseInt(location_id) : 0;

//     // Insert the new lead type into the database using a parameterized query
//     const query =
//       "INSERT INTO product_props_mast(product_id,type_id,prop_name ,  created_at , created_by ) VALUES (?, ?, ?, ?,?)";
//     const values = [
//       productId,
//       typeId,
//       propName,
//       // remarkValue,
//       creation_date,
//       created_By,
//       // locationIdValue,
//     ];
//     const result = await connection.promise().query(query, values);

//     // console.log('Department added successfully');
//     res.status(200).send("props added successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Failed to add props to database");
//   }
// });
//2/9/23 check code
app.post("/proppost", async (req, res) => {
  console.log("post productpropspost API hit");
  try {
    // Extract data from the request body
    const { type_id, prop_name, remark, created_by } = req.body;

    const typeId = type_id || 0;
    const propName = prop_name || "";
    const createdBy = created_by || 0;
    const createdAt = new Date();

    // Insert the new user field into the product_props_mast table
    const insertFieldQuery = `
      INSERT INTO product_props_mast  (
        product_id ,
        type_id ,
        prop_name ,
        created_by ,
        created_at 
      )
      VALUES (?,?,?,?,?)
    `;

    const fieldValues = [
      0, // Temporary product_id value
      typeId,
      propName,
      createdBy,
      createdAt,
    ];

    // Execute the insert query for the product field
    await connection.promise().query(insertFieldQuery, fieldValues);

    console.log("prop added successfully");

    // Get the ID of the last inserted row in Product_mast
    const lastProductQuery =
      "SELECT Product_id  FROM Product_mast ORDER BY Product_id  DESC LIMIT 1";
    const [lastProductResult] = await connection
      .promise()
      .query(lastProductQuery);
    const lastProductId = lastProductResult[0].Product_id;
    console.log("lastProductId", lastProductId);

    // Update the product_id in the product_props_mast table for the last inserted record
    const updateProductFieldQuery = `
      UPDATE product_props_mast 
      SET product_id= ?
      WHERE id = LAST_INSERT_ID()
    `;

    await connection.promise().query(updateProductFieldQuery, [lastProductId]);

    console.log("product_id in product_props_mast updated successfully");

    res.status(200).send("Product prop added successfully");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error adding product prop to database: " + error.message);
  }
});

// get props data
app.get("/propsdata/:product_id", (req, res) => {
  const productId = req.params.product_id; // Get the product ID from the URL parameter
  console.log(
    `Retrieving product props information for product ID: ${productId}`
  );

  const query = `
    SELECT 
      p.*,
      t.Product_name
    FROM 
      product_props_mast AS p
      LEFT JOIN Product_mast AS t ON p.product_id = t.Product_id 
    WHERE
      p.product_id = ?;
  `;

  // Send the query to the MySQL database with the product ID parameter and handle any errors or data retrieved
  connection.query(query, [productId], (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500); // Send HTTP status code 500 for server error
      return;
    }

    const data = results; // Store the retrieved data in a variable

    res.send({ data: data }); // Send the data back to the client
  });
});
//update props data
app.put("/propsdataupdate/:id", (req, res) => {
  var d1 = new Date();

  // Extract data from the request body and URL parameter
  const { product_id, type_id, prop_name, Last_updated_by } = req.body;
  const id = req.params.id;

  // Construct the update object with empty values for unspecified fields
  const updateObject = {
    product_id: product_id || 0,
    prop_name: prop_name || "",
    type_id: type_id || 0,
    last_updated_by: Last_updated_by || 0,
    last_updated_at: d1,
  };

  // Updating sitting record in the database using the provided ID
  connection.query(
    "UPDATE product_props_mast SET ? WHERE id = ?",
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
        const message = `desi record with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      // If the update query was successful and at least one row was affected, send a success message
      const message = `desi record with ID ${id} updated successfully`;
      res.status(200).send({ message });
    }
  );
});

app.delete("/propdelete/:id", (req, res) => {
  const id = req.params.id;
  console.log("for props deleteid##", id);
  connection.query(
    "DELETE FROM product_props_mast WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      if (results.affectedRows === 0) {
        const message = `Product prop with ID ${id} not found`;
        res.status(404).send(message);
        return;
      }
      const message = `Product prop with ID ${id} deleted successfully`;
      res.status(200).send({ message });
    }
  );
});

module.exports = app;
