const express = require("express");
const cors = require("cors");   // ✅ FIXED
const mysql = require("mysql2");

const nodemailer = require("nodemailer");
const mysqldump = require("mysqldump");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://nirmalani-payroll.vercel.app"
  ]
}));

app.use(express.json());

// ================= DEBUG ENV =================
console.log("ENV CHECK:", {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  db: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// ================= DATABASE =================

const db = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "root123",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306,

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
  const { name, rate_per_day, epf_no } = req.body;

  db.query(
    "INSERT INTO plantation_workers (name, rate_per_day, epf_no) VALUES (?, ?, ?)",
    [name, rate_per_day, epf_no],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Worker added" });
    }
  );
});


// 🌿 Attendance
app.post('/plantation-attendance', (req, res) => {
  const { worker_id, days_worked, month } = req.body;

  db.query(
    "INSERT INTO plantation_attendance (worker_id, days_worked, month) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE days_worked = VALUES(days_worked)",
    [worker_id, days_worked, month],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Attendance added" });
    }
  );
});

// 🌿 Daily Attendance
app.post("/plantation-daily-attendance", (req, res) => {
  const { worker_id, date, status } = req.body;

  const sql = `
    INSERT INTO plantation_daily_attendance (worker_id, date, status)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [worker_id, date, status], (err) => {
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
      pw.rate_per_day,
      pw.epf_no,
      COUNT(pda.date) AS days_worked,
      DATE_FORMAT(pda.date, '%Y-%m') AS month
    FROM plantation_workers pw
    JOIN plantation_daily_attendance pda   -- 🔥 CHANGE LEFT → JOIN
      ON pw.id = pda.worker_id
    WHERE pda.status = 'present'
    GROUP BY pw.id, DATE_FORMAT(pda.date, '%Y-%m')
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 🌿 Get Working Dates
app.get("/plantation-attendance-dates", (req, res) => {
  const { worker_id, month } = req.query;

  // 🔴 IMPORTANT: check inputs
  if (!worker_id || !month) {
    return res.status(400).json({ error: "Missing worker_id or month" });
  }

  const sql = `
    SELECT date
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
      rate,
      allowance,
      total_earning,
      date,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      worker_id,
      liter,
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

// ================= DATABASE BACKUP =================

app.get("/backup-db", async (req, res) => {

  try {

    console.log("STEP 1 - Backup route started");

    const backupDir = path.join(__dirname, "backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    console.log("STEP 2 - Backup folder ready");

    const fileName =
      `backup-${new Date().toISOString().split("T")[0]}.sql`;

    const filePath = path.join(backupDir, fileName);

    console.log("STEP 3 - Starting mysqldump");

    await mysqldump({
      connection: {
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT
      },

      dumpToFile: filePath,
    });

    console.log("STEP 4 - mysqldump completed");

    const transporter = nodemailer.createTransport({

      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("STEP 5 - Sending email");

    await transporter.sendMail({

      from: process.env.SMTP_USER,

      to: "nirmalaniplantation@gmail.com",

      subject: "Monthly Payroll Backup",

      text: "Attached is your payroll database backup.",

      attachments: [
    {
      filename: fileName,
      path: filePath,
    },
  ],
});

    console.log("STEP 6 - Email sent");

    res.json({
      success: true,
      message: "Backup emailed successfully"
    });

  } catch (err) {

    console.log("BACKUP ERROR:");
    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

