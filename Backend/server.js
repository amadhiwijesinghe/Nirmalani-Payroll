require("dotenv").config();
const express = require("express");
const cors = require("cors");   // ✅ FIXED
const mysql = require("mysql2");

const mysqldump = require("mysqldump");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://nirmalani-payroll.vercel.app"
  ]
}));

app.use(express.json());

require("./services/backupService");

const backupRoutes = require("./routes/backupRoutes");

app.use("/api/backup", backupRoutes);


// ================= DEBUG ENV =================
console.log("ENV CHECK:", {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  db: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// ================= DATABASE =================

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root123",
  database: process.env.DB_NAME || "railway",
  port: process.env.DB_PORT || 3306,

  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ================= ROOT =================

app.get("/", (req, res) => {
  res.send("Backend Working 🚀");
});

// ================= LOGIN =================

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "Admin@2026") {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// ================= EMPLOYEES =================

app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/employees", (req, res) => {
  const { name, memberid, NIC, basic_salary } = req.body;

  db.query(
    "INSERT INTO employees (name, memberid, NIC, basic_salary) VALUES (?, ?, ?, ?)",
    [name, memberid, NIC, basic_salary],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.put("/employees/:id", (req, res) => {
  const { name, memberid, NIC, basic_salary } = req.body;

  db.query(
    "UPDATE employees SET name=?, memberid=?, NIC=?, basic_salary=? WHERE id=?",
    [name, memberid, NIC, basic_salary, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.delete("/employees/:id", (req, res) => {
  db.query(
    "DELETE FROM employees WHERE memberid=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ================= ATTENDANCE =================

app.post("/attendance", (req, res) => {
  const { memberid, date, present, month } = req.body;

  const sql = `
    INSERT INTO attendance (memberid, date, present, month)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE present = VALUES(present)
  `;

  db.query(sql, [memberid, date, present, month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Saved");
  });
});

app.get("/attendance", (req, res) => {
  const query = `
    SELECT a.*, e.name
    FROM attendance a
    JOIN employees e ON a.memberid = e.memberid
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ================= ALLOWANCE =================

app.post("/allowance", (req, res) => {
  const { memberid, month, amount } = req.body;

  db.query(
    "INSERT INTO allowances (memberid, month, amount) VALUES (?, ?, ?)",
    [memberid, month, amount],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.send("Allowance Saved");
    }
  );
});

app.get("/allowance-summary", (req, res) => {
  const month = req.query.month;

  let query = `
    SELECT a.memberid, e.name, a.month, a.amount
    FROM allowances a
    JOIN employees e ON a.memberid = e.memberid
  `;

  if (month) {
    query += " WHERE a.month = ?";
    db.query(query, [month], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  } else {
    db.query(query, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
});

// ================= PAYROLL (FIXED) =================

app.get("/payroll/:month?", (req, res) => {
  const month = req.params.month;

  let query = `
    SELECT 
      e.memberid,
      e.name,
      e.basic_salary,
      IFNULL(att.days_worked, 0) AS days_worked,
      IFNULL(al.total_allowance, 0) AS total_allowance,
      att.month
    FROM employees e
    LEFT JOIN (
      SELECT memberid, month,
      SUM(CASE WHEN present = 1 THEN 1 ELSE 0 END) AS days_worked
      FROM attendance
      GROUP BY memberid, month
    ) att ON e.memberid = att.memberid
    LEFT JOIN (
      SELECT memberid, month,
      SUM(amount) AS total_allowance
      FROM allowances
      GROUP BY memberid, month
    ) al ON e.memberid = al.memberid AND att.month = al.month
  `;

  if (month) {
    query += " WHERE att.month = ?";
    db.query(query, [month], handleResult);
  } else {
    db.query(query, handleResult);
  }

  function handleResult(err, result) {
    if (err) return res.status(500).json(err);

    const data = result.map(row => {
      const basic = Number(row.basic_salary) || 0;
      const allowance = Number(row.total_allowance) || 0;

      const epf = basic * 0.08;
      const net = basic + allowance - epf;

      return {
        ...row,
        epf: epf.toFixed(2),
        net_salary: net.toFixed(2)
      };
    });

    res.json(data);
  }
});

// ================= PLANTATION WORKERS =================
// 🌿 Plantation Workers
app.get('/plantation-workers', (req, res) => {
  db.query("SELECT * FROM plantation_workers", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post('/plantation-workers', (req, res) => {

  const { name, epf_no } = req.body;

  db.query(
    "INSERT INTO plantation_workers (name, epf_no) VALUES (?, ?)",
    [name, epf_no],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      res.json({
        success: true,
        message: "Worker added"
      });
    }
  );
});

// UPDATE PLANTATION WORKER
app.put("/plantation-workers/:id", (req, res) => {

  const { name, epf_no } = req.body;

  db.query(
    "UPDATE plantation_workers SET name=?, epf_no=? WHERE id=?",
    [name, epf_no, req.params.id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Worker updated"
      });
    }
  );
});

// 🌿 Attendance
app.post('/plantation-attendance', (req, res) => {

  const { worker_id, days_worked, month, allowance, rate_per_day } = req.body;

  const sql = `
    INSERT INTO plantation_attendance
    (
      worker_id,
      days_worked,
      month,
      allowance,
      rate_per_day
    )
    VALUES (?, ?, ?, ?, ?)

    ON DUPLICATE KEY UPDATE
      days_worked = VALUES(days_worked),
      allowance = VALUES(allowance),
      rate_per_day = VALUES(rate_per_day)
  `;

  db.query(
    sql,
    [
      worker_id,
      days_worked,
      month,
      allowance || 0,
      rate_per_day || 0
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      res.json({
        success: true,
        message: "Attendance added"
      });
    }
  );
});

// UPDATE PLANTATION PAYROLL
app.put("/plantation-attendance", (req, res) => {

  const {
    worker_id,
    month,
    rate_per_day
  } = req.body;

  const sql = `
    UPDATE plantation_attendance
    SET rate_per_day = ?
    WHERE worker_id = ?
    AND month = ?
  `;

  db.query(
    sql,
    [
      rate_per_day,
      worker_id,
      month
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Rate updated"
      });
    }
  );
});

// DELETE FULL PLANTATION PAYROLL
app.delete("/plantation-attendance", (req, res) => {

  const {
    worker_id,
    month
  } = req.query;

  // DELETE MONTHLY PAYROLL
  const deletePayroll = `
    DELETE FROM plantation_attendance
    WHERE worker_id = ?
    AND month = ?
  `;

  // DELETE DAILY ATTENDANCE
  const deleteDaily = `
    DELETE FROM plantation_daily_attendance
    WHERE worker_id = ?
    AND DATE_FORMAT(date, '%Y-%m') = ?
  `;

  db.query(
    deletePayroll,
    [worker_id, month],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      db.query(
        deleteDaily,
        [worker_id, month],
        (err2) => {

          if (err2) {
            console.log(err2);
            return res.status(500).json(err2);
          }

          res.json({
            success: true,
            message:
              "Payroll and attendance deleted"
          });
        }
      );
    }
  );
});

// 🌿 Daily Attendance
app.post("/plantation-daily-attendance", (req, res) => {

  const {
    worker_id,
    date,
    status,
    rate_per_day
  } = req.body;

  const sql = `
    INSERT INTO plantation_daily_attendance
    (
      worker_id,
      date,
      status,
      rate_per_day
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      worker_id,
      date,
      status,
      rate_per_day
    ],
    (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).send("Already marked for this date");
      }
      return res.status(500).send(err);
    }

    res.send("Attendance saved");
  });
});

app.get("/plantation-attendance-days", (req, res) => {
  const { worker_id, month } = req.query;

  const sql = `
    SELECT COUNT(*) AS days
    FROM plantation_daily_attendance
    WHERE worker_id = ?
    AND DATE_FORMAT(date, '%Y-%m') = ?
    AND status = 'present'
  `;

  db.query(sql, [worker_id, month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});


// 🌿 Combined Data
app.get('/plantation-data', (req, res) => {

  const sql = `
    SELECT 
      pw.id AS worker_id,
      pw.name,
      pw.epf_no,

      IFNULL(MAX(pa.rate_per_day), 0) AS rate_per_day,
      IFNULL(MAX(pa.allowance), 0) AS allowance,

      COUNT(pda.id) AS days_worked,

      DATE_FORMAT(pda.date, '%Y-%m') AS month

    FROM plantation_workers pw

    JOIN plantation_daily_attendance pda
      ON pw.id = pda.worker_id

    LEFT JOIN plantation_attendance pa
      ON pa.worker_id = pw.id
      AND pa.month = DATE_FORMAT(pda.date, '%Y-%m')

    WHERE pda.status = 'present'

    GROUP BY
      pw.id,
      pw.name,
      pw.epf_no,
      DATE_FORMAT(pda.date, '%Y-%m')

    ORDER BY month DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log("PLANTATION DATA ERROR:", err);

      return res.status(500).json({
        error: err.message
      });
    }

    res.json(result);
  });
});

// 🌿 Get Working Dates
app.get("/plantation-attendance-dates", (req, res) => {
  const { worker_id, month } = req.query;

  if (!worker_id || !month) {
    return res.status(400).json({ error: "Missing worker_id or month" });
  }

  const sql = `
    SELECT
      id,
      date,
      rate_per_day
    FROM plantation_daily_attendance
    WHERE worker_id = ?
    AND date LIKE CONCAT(?, '%')
    ORDER BY date ASC
  `;

  db.query(sql, [worker_id, month], (err, result) => {
    if (err) {
      console.error("SQL ERROR:", err); // 👈 VERY IMPORTANT
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});

// ================= DELETE PLANTATION ATTENDANCE =================

app.delete("/plantation-daily-attendance/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM plantation_daily_attendance WHERE id = ?",
    [id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Attendance deleted"
      });
    }
  );
});

// ================= RUBBER TAPPERS ============
//ADD

app.get('/rubber-tappers', (req, res) => {
  db.query("SELECT * FROM rubber_tappers", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post('/rubber-tappers', (req, res) => {

  const { name } = req.body;

  db.query(
    "INSERT INTO rubber_tappers (name) VALUES (?)",
    [name],
    (err, result) => {

      if (err) {
        console.log("SQL ERROR:", err);
        return res.status(500).send(err);
      }

      res.json({
        success: true,
        message: "Worker added"
      });
    }
  );
});

// ================= RUBBER TAPPERS ATTENDANCE =================

// ADD DAILY ATTENDANCE
app.post("/rubber-tappers-attendance", (req, res) => {

const {
  worker_id,
  liter,
  brc,
  kg,
  rate,
  allowance,
  total_earning,
  date,
  status
} = req.body;

  const sql = `
    INSERT INTO rubber_tappers_attendance
    (
      worker_id,
      liter,
      brc,
      kg,
      rate,
      allowance,
      total_earning,
      date,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      worker_id,
      liter,
      brc,
      kg,
      rate,
      allowance || 0,
      total_earning || 0,
      date,
      status || "present"
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Already marked for this date"
          });
        }

        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Attendance Saved"
      });
    }
  );
});

// GET ALL DATA
app.get("/rubber-tappers-data", (req, res) => {

  const sql = `
    SELECT
      rta.id,
      rta.worker_id,
      rt.name,
      rta.liter,
      rta.brc,
      rta.kg,
      rta.rate,
      rta.allowance,
      rta.total_earning,
      rta.date,
      DATE_FORMAT(rta.date, '%Y-%m') AS month,
      rta.status
    FROM rubber_tappers_attendance rta
    JOIN rubber_tappers rt
      ON rt.id = rta.worker_id
    ORDER BY rta.date DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    res.json(result);
  });
});

// ================= DELETE RUBBER TAPPER ATTENDANCE =================

app.delete("/rubber-tappers-attendance/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM rubber_tappers_attendance WHERE id = ?",
    [id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Attendance deleted"
      });
    }
  );
});

// ================= UPDATE RUBBER TAPPER ATTENDANCE =================

app.put("/rubber-tappers-attendance/:id", (req, res) => {

  const {
    liter,
    rate,
    allowance,
    total_earning
  } = req.body;

  const id = req.params.id;

  const sql = `
    UPDATE rubber_tappers_attendance
    SET
      liter = ?,
      rate = ?,
      allowance = ?,
      total_earning = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      liter,
      rate,
      allowance,
      total_earning,
      id
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Attendance updated"
      });
    }
  );
});

// ================= FULL SYSTEM PDF REPORT =================

app.get("/full-system-report/:month", async (req, res) => {

  const month = req.params.month;

  try {

    // EMPLOYEES
    const employees = await new Promise((resolve, reject) => {

      db.query(
        "SELECT * FROM employees",
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // ATTENDANCE
    const attendance = await new Promise((resolve, reject) => {

      const sql = `
        SELECT a.*, e.name
        FROM attendance a
        JOIN employees e
          ON e.memberid = a.memberid
        WHERE a.month = ?
      `;

      db.query(sql, [month], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // ALLOWANCES
    const allowances = await new Promise((resolve, reject) => {

      const sql = `
        SELECT al.*, e.name
        FROM allowances al
        JOIN employees e
          ON e.memberid = al.memberid
        WHERE al.month = ?
      `;

      db.query(sql, [month], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // RUBBER TAPPERS
    const rubber = await new Promise((resolve, reject) => {

      const sql = `
        SELECT
          rt.name,
          rta.*
        FROM rubber_tappers_attendance rta
        JOIN rubber_tappers rt
          ON rt.id = rta.worker_id
        WHERE DATE_FORMAT(rta.date, '%Y-%m') = ?
      `;

      db.query(sql, [month], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // CREATE PDF
    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    const fileName =
      `full-system-report-${month}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    doc.pipe(res);

    // TITLE
    doc
      .fontSize(22)
      .text(
        "Nirmalani Plantation Full System Report",
        { align: "center" }
      );

    doc.moveDown();

    doc
      .fontSize(16)
      .text(`Month: ${month}`);

    doc.moveDown(2);

    // ================= EMPLOYEES =================

    doc
      .fontSize(18)
      .text("Employees");

    doc.moveDown();

    employees.forEach(emp => {

      doc
        .fontSize(12)
        .text(
          `Name: ${emp.name} | Member ID: ${emp.memberid} | Salary: Rs.${emp.basic_salary}`
        );
    });

    doc.moveDown(2);

    // ================= ATTENDANCE =================

    doc
      .fontSize(18)
      .text("Attendance");

    doc.moveDown();

    attendance.forEach(a => {

      doc
        .fontSize(12)
        .text(
          `${a.name} | ${a.date.toISOString().split("T")[0]} | Present: ${a.present}`
        );
    });

    doc.moveDown(2);

    // ================= ALLOWANCES =================

    doc
      .fontSize(18)
      .text("Allowances");

    doc.moveDown();

    allowances.forEach(al => {

      doc
        .fontSize(12)
        .text(
          `${al.name} | Rs.${al.amount}`
        );
    });

    doc.moveDown(2);

    // ================= RUBBER TAPPERS =================

    doc
      .fontSize(18)
      .text("Rubber Tappers");

    doc.moveDown();

    let rubberTotal = 0;

    rubber.forEach(r => {

      rubberTotal += Number(r.total_earning);

      doc
        .fontSize(12)
        .text(
          `${r.name} | ${r.date.toISOString().split("T")[0]} | Liter: ${r.liter} | Rate: ${r.rate} | Total: Rs.${r.total_earning}`
        );
    });

    doc.moveDown();

    doc
      .fontSize(14)
      .text(
        `Rubber Tappers Total: Rs.${rubberTotal.toFixed(2)}`
      );

    doc.moveDown(3);

    doc
      .fontSize(12)
      .text(
        "Generated Automatically by Nirmalani Payroll System",
        {
          align: "center"
        }
      );

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json(err);
  }
});

// ================= TEA COLLECTION =================

// ADD TEA COLLECTION
app.post("/tea-collection", (req, res) => {

  const {
    worker_id,
    date,
    kg
  } = req.body;

  const sql = `
    INSERT INTO tea_collection
    (
      worker_id,
      date,
      kg
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [
      worker_id,
      date,
      kg
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Tea collection saved"
      });
    }
  );
});

// GET TEA COLLECTION
app.get("/tea-collection", (req, res) => {

  const sql = `
    SELECT
      tc.id,
      tc.worker_id,
      tc.date,
      tc.kg,

      pw.name,
      pw.epf_no

    FROM tea_collection tc

    JOIN plantation_workers pw
      ON pw.id = tc.worker_id

    ORDER BY tc.date DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// UPDATE TEA COLLECTION
app.put("/tea-collection/:id", (req, res) => {

  const id = req.params.id;

  const { kg } = req.body;

  db.query(
    "UPDATE tea_collection SET kg = ? WHERE id = ?",
    [kg, id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Updated"
      });
    }
  );
});

// DELETE TEA COLLECTION
app.delete("/tea-collection/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM tea_collection WHERE id = ?",
    [id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Deleted successfully"
      });
    }
  );
});

// ================= RUBBER DISPATCH =================

// ADD DISPATCH
app.post("/rubber-dispatch", (req, res) => {

  const {
    liters_sent,
    date
  } = req.body;

  const sql = `
    INSERT INTO rubber_dispatch
    (
      liters_sent,
      date
    )
    VALUES (?, ?)
  `;

  db.query(
    sql,
    [
      liters_sent,
      date
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Dispatch Saved"
      });
    }
  );
});

// GET DISPATCH DATA
app.get("/rubber-dispatch", (req, res) => {

  const sql = `
    SELECT *
    FROM rubber_dispatch
    ORDER BY date DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// DELETE DISPATCH
app.delete("/rubber-dispatch/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM rubber_dispatch WHERE id = ?",
    [id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Deleted"
      });
    }
  );
});

// UPDATE DISPATCH
app.put("/rubber-dispatch/:id", (req, res) => {

  const id = req.params.id;

  const { liters_sent } = req.body;

  db.query(
    `
    UPDATE rubber_dispatch
    SET liters_sent = ?
    WHERE id = ?
    `,
    [liters_sent, id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Updated"
      });
    }
  );
});

// ================= RUBBER COLLECTION =================

// ADD COLLECTION
app.post("/rubber-collection", (req, res) => {

  const {
    liters_collected,
    date
  } = req.body;

  const sql = `
    INSERT INTO rubber_collection
    (
      liters_collected,
      date
    )
    VALUES (?, ?)
  `;

  db.query(
    sql,
    [
      liters_collected,
      date
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Collection Saved"
      });
    }
  );
});

app.get("/rubber-collection", (req, res) => {

  const sql = `
    SELECT *
    FROM rubber_collection
    ORDER BY date DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ================= CASUAL WORKERS =========
app.get("/casual-workers-data", (req, res) => {

  const sql = `
    SELECT

      MAX(cwa.id) AS id,

      cw.id AS worker_id,

      cw.name,

      cwa.month,

      COUNT(cwa.id) AS days_worked,

      MAX(cwa.daily_rate) AS daily_rate,

      SUM(cwa.allowance) AS allowance,

      SUM(cwa.total_earning) AS total_earning

    FROM casual_worker_attendance cwa

    JOIN casual_workers cw
    ON cw.id = cwa.worker_id

    GROUP BY
      cw.id,
      cwa.month

    ORDER BY
      cwa.month DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log("SQL ERROR:", err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});


// GET CASUAL WORKER ATTENDANCE DATES
app.get(
  "/casual-workers-attendance-dates",
  (req, res) => {

    const {
      worker_id,
      month
    } = req.query;

    const sql = `
      SELECT
        id,
        date,
        daily_rate
      FROM casual_worker_attendance
      WHERE worker_id = ?
      AND month = ?
      ORDER BY date ASC
    `;

    db.query(
      sql,
      [worker_id, month],
      (err, result) => {

        if (err) {

          console.log(err);

          return res.status(500).json(err);
        }

        res.json(result);
      }
    );
  }
);

// GET CASUAL WORKERS
app.get("/casual-workers", (req, res) => {

  db.query(
    "SELECT * FROM casual_workers ORDER BY id DESC",
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ADD CASUAL WORKERS
app.post("/casual-workers", (req, res) => {

  const { name } = req.body;

  db.query(
    `
    INSERT INTO casual_workers (name)
    VALUES (?)
    `,
    [name],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ADD DAILY ATTENDANCE - CASUAL WORKERS
app.post(
  "/casual-workers-attendance",
  (req, res) => {

    const {
      worker_id,
      daily_rate,
      allowance,
      total_earning,
      date,
      month,
      status
    } = req.body;

    const sql = `
      INSERT INTO casual_worker_attendance
      (
        worker_id,
        daily_rate,
        allowance,
        total_earning,
        date,
        month,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        worker_id,
        daily_rate,
        allowance || 0,
        total_earning || 0,
        date,
        month,
        status || "present"
      ],
      (err, result) => {

        if (err) {

          console.log(
            "INSERT ERROR:",
            err
          );

          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Attendance Saved"
        });
      }
    );
  }
);

// DELETE ATTENDANCE - CASUAL WORKERS
app.delete(
  "/casual-workers-attendance/:id",
  (req, res) => {

    const { id } = req.params;

    db.query(
      `
      DELETE FROM casual_worker_attendance
      WHERE id = ?
      `,
      [id],
      (err, result) => {

        if (err) {

          console.log(err);

          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Deleted"
        });
      }
    );
  }
);

// UPDATE CASUAL WORKERS
app.put(
  "/casual-workers-attendance/:id",
  (req, res) => {

    const { id } = req.params;

    const {
      daily_rate,
      allowance,
      total_earning
    } = req.body;

    const sql = `
      UPDATE casual_worker_attendance
      SET
        daily_rate = ?,
        allowance = ?,
        total_earning = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        daily_rate,
        allowance,
        total_earning,
        id
      ],
      (err, result) => {

        if (err) {

          console.log(err);

          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Updated"
        });
      }
    );
  }
);


// ================= INCOME ================
// GET INCOME
app.get("/income", (req,res)=>{

  db.query(
    "SELECT * FROM income ORDER BY date DESC",
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ADD INCOME
app.post("/income", (req,res)=>{

  const {
    category,
    amount,
    note,
    date
  } = req.body;

  const sql = `
    INSERT INTO income
    (
      category,
      amount,
      note,
      date
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      category,
      amount,
      note,
      date
    ],
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ================ EXPENDITURE ============
// GET EXPENDITURE
app.get("/expenditure", (req,res)=>{

  db.query(
    "SELECT * FROM expenditure ORDER BY date DESC",
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ADD EXPENDITURE
app.post("/expenditure", (req,res)=>{

  const {
    category,
    sub_category,
    amount,
    note,
    date
  } = req.body;

  const sql = `
    INSERT INTO expenditure
    (
      category,
      sub_category,
      amount,
      note,
      date
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      category,
      sub_category,
      amount,
      note,
      date
    ],
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

