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

app.post("/attendencemastpost", async (req, res) => {
  console.log("post attendencemast api hit");

  try {
    const {
      dept,
      user_id,
      noOfabsent,
      month,
      year,
      bonus,
      remark,
      created_by,
    } = req.body;

    const Dept = dept || "";
    const User_id = user_id || "";
    const No_of_absent = noOfabsent || 0;
    const Month = month || "";
    const Year = year || "";
    const Bonus = bonus || 0;
    const Remark = remark || "";
    // const work_days = 26;
    // const presentDays = work_days - noOfabsent;
    // const perdaysal = total_salary / work_days;
    // const totalSalary = perdaysal * presentDays;
    // const tdsDeduction = (total_salary * tds_deduction) / 100; 
    // const netSalary = totalSalary - tdsDeduction + bonus;

    // Check if created_by is defined and convert to integer
    const created_By = created_by ? parseInt(created_by) : 0;
    const creation_date = new Date();
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();

    const attendencequery = connection.query(
      `select * from attendence_mast WHERE user_id = ? AND month = ? AND year = ?`,
      [req.body.user_id, req.body.month, req.body.year],
      async (err, results3) => {
        console.log('attendance mast ka data', results3)
        console.log('uski length length', results3.length)
        if (results3.length == 0) {

          const query1 = connection.query(
            `SELECT * FROM user_mast WHERE job_type ='WFH'`,
            async (err, results1) => {
              // console.log('userMast data', results1)
              for (const user of results1) {
                const work_days = 26;
                console.log("workdays",work_days);
                const presentDays = work_days - 0;
                console.log("presentDays",presentDays);
                const perdaysal = user.salary / work_days;
                console.log("predaysal",perdaysal,user.salary);
                const totalSalary = perdaysal * presentDays;
                console.log("totalSalary",totalSalary);
                const tdsDeduction = (totalSalary * user.tds_per) / 100; 
                console.log("tdsDeduction",tdsDeduction);
                const netSalary = totalSalary - tdsDeduction + bonus;
                console.log("nesl",netSalary);

                const query2 = `INSERT INTO attendence_mast (dept, user_id, noOfabsent, month, year, bonus,total_salary,tds_deduction,net_salary, remark, created_by, creation_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?, ?, ?)`;
                const values2 = [
                  user.dept_id,
                  user.user_id,
                  0,
                  currentMonthName,
                  currentYear,
                  0,
                  user.salary,
                  user.tds_per,
                  netSalary,
                  '',
                  99,
                  creation_date,
                ];
                const results2 = await connection.promise().query(query2, values2);
                console.log("All users inserted success 1111");

              }
              const attendencequery1 = connection.query(
                `select * from attendence_mast WHERE user_id = ? AND month = ? AND year = ?`,
                [req.body.user_id, req.body.month, req.body.year],
                async (err, results2) => {
                  console.log('Single Update', results2)
                  const updatequery = "UPDATE attendence_mast SET dept=?, user_id=?, noOfabsent=?, month=?, year=?, bonus=?, total_salary=?,tds_deduction=?,net_salary=?, remark=?, created_by=?, creation_date=? WHERE attendence_id = ?";
                  const updateValues =
                    [Dept,
                      User_id,
                      No_of_absent,
                      Month,
                      Year,
                      Bonus,
                      results2[0].total_salary,
                      results2[0].tds_deduction,
                      results2[0].net_salary,
                      Remark,
                      created_By,
                      creation_date,
                      results2[0].attendence_id
                    ];

                  await connection.promise().query(updatequery,updateValues);
                  console.log("attendence user updated successfully ");
                }
              )
            })

        } else {
          if (req.body.user_id == results3[0].user_id && req.body.month == results3[0].month && req.body.year == results3[0].year) {
            const updatequery = "UPDATE attendence_mast SET dept=?, user_id=?, noOfabsent=?, month=?, year=?, bonus=?,total_salary=?,tds_deduction=?,net_salary=? , remark=?, created_by=?, creation_date=? WHERE attendence_id = ?";
            const updateValues =
              [Dept,
                User_id,
                No_of_absent,
                Month,
                Year,
                Bonus,
                results3[0].total_salary,
                results3[0].tds_deduction,
                results3[0].net_salary,
                Remark,
                created_By,
                creation_date,
                results3[0].attendence_id
              ];

            const tempVariable = await connection.promise().query(updatequery,updateValues);
            console.log("second update", tempVariable)
            console.log("attendence user updated successfully");
          } else {
            const query1 = connection.query(
              `SELECT * FROM user_mast WHERE job_type ='WFH'`,
              async (err, results1) => {
                // console.log("last Else", results1)
                for (const user of results1) {
                  const work_days = 26;
                  const presentDays = work_days - 0;
                  const perdaysal = total_salary / work_days;
                  const totalSalary = perdaysal * presentDays;
                  const tdsDeduction = (total_salary * tds_deduction) / 100; 
                  const netSalary = totalSalary - tdsDeduction + bonus;
                  const query2 = `INSERT INTO attendence_mast (dept, user_id, noOfabsent, month, year, bonus, total_salary,tds_deduction,net_salary, remark, created_by, creation_date)
                    VALUES (?, ?, ?, ?, ?, ?, ,? , ?, ?, ?, ?, ?)`;
                  const values2 = [
                    user.dept_id,
                    user.user_id,
                    0,
                    currentMonthName,
                    currentYear,
                    0,
                    user.salary,
                    user.tds_per,
                    netSalary,
                    '',
                    99,
                    creation_date,
                  ];
                  const results2 = await connection.promise().query(query2,values2);
                  console.log("All users inserted success 2222");

                }
                const attendencequery1 = connection.query(
                  `select * from attendence_mast WHERE user_id = ? AND month = ? AND year = ?`,
                  [req.body.user_id, req.body.month, req.body.year],
                  async (err, results3) => {
                    const updatequery = "UPDATE attendence_mast SET dept=?, user_id=?, noOfabsent=?, month=?, year=?, bonus=?,total_salary=?,tds_deduction=?,net_salary=? , remark=?, created_by=?, creation_date=? WHERE attendence_id = ?";

                    const updateValues =
                      [Dept,
                        User_id,
                        No_of_absent,
                        Month,
                        Year,
                        Bonus,
                        totalSalary,
                        tdsDeduction,
                        netSalary,
                        Remark,
                        created_By,
                        creation_date,
                        results3[0].attendence_id
                      ];

                    await connection.promise().query(updatequery, updateValues);
                    console.log("attendence user updated successfully");
                  }
                )

              })
          }
        }

        res.status(200).send("All users inserted success");
      })
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding attendencemast to database");
  }
});

app.post("/salaryfromattendence", (req, res) => {
  const requestedDept = req.body.dept_id; 
  const requestedMonth = req.body.month;
  const requestedYear = req.body.year;

  const attendencequery1 = connection.query(
    `select * from attendence_mast WHERE dept = ? AND month = ? AND year = ?`,
    [req.body.dept_id, req.body.month, req.body.year],
    async (err, results) => {
      res.json({ data: results });
    }
  )
});

module.exports = app;
