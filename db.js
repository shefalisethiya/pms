const mysql = require("mysql2");
// Database credentials
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "New@password123",
  database: "pms",
});

// Establish a database connection
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

module.exports = connection; // Export the connection
