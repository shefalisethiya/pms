const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const connection = require("./db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import user routes
const userRoutes = require("./controllers/user");
const deptRoutes = require("./controllers/dept");
const logoRoutes = require("./controllers/logo");
app.use(userRoutes);
app.use(deptRoutes);
app.use(logoRoutes);
const announcementRoutes = require("./controllers/announcement");
const attendenceRoutes = require("./controllers/attendencs");
const desiRoutes = require("./controllers/desi");
app.use(announcementRoutes);
app.use(attendenceRoutes);
app.use(desiRoutes);
const ipRoutes = require("./controllers/ip");
const jobresponRoutes = require("./controllers/jobrespon");
const kraRoutes = require("./controllers/kra");
app.use(ipRoutes);
app.use(jobresponRoutes);
app.use(kraRoutes);
const leadRoutes = require("./controllers/lead");
const leadmarkRoutes = require("./controllers/leadmark");
// const logoRoutes = require("./controllers/logo");
app.use(leadRoutes);
app.use(leadmarkRoutes);
// app.use(logoRoutes);
const logobrandRoutes = require("./controllers/logobrand");
const objmastRoutes = require("./controllers/objmast");
const productRoutes = require("./controllers/product");
app.use(logobrandRoutes);
app.use(objmastRoutes);
app.use(productRoutes);
const roleRoutes = require("./controllers/role");
const salarygenRoutes = require("./controllers/salarygen");
const simRoutes = require("./controllers/sim");
app.use(roleRoutes);
app.use(salarygenRoutes);
app.use(simRoutes);
const sittingRoutes = require("./controllers/sitting");

app.use(sittingRoutes);

// Start the server
const port = 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
