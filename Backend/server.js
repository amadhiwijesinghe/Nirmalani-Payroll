const express = require("express");
const cors = require("cors");   // ✅ FIXED
const mysql = require("mysql2");

const app = express();

app.use(cors({
  origin: "*"
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
  database: process.env.MYSQLDATABASE || "nirmalani_payroll_system",
  port: process.env.MYSQLPORT || 3306,
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

  db.query(
    "INSERT INTO attendance (memberid, date, present, month) VALUES (?, ?, ?, ?)",
    [memberid, date, present, month],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.send("Attendance Saved");
    }
  );
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
  const { name, rate_per_day } = req.body;

  db.query(
    "INSERT INTO plantation_workers (name, rate_per_day) VALUES (?, ?)",
    [name, rate_per_day],
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
    "INSERT INTO plantation_attendance (worker_id, days_worked, month) VALUES (?, ?, ?)",
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
      console.error(err);
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
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json(result[0]);
  });
});


// 🌿 Combined Data
app.get('/plantation-data', (req, res) => {
  const sql = `
    SELECT pw.id, pw.name, pw.rate_per_day,
           pa.days_worked, pa.month
    FROM plantation_workers pw
    LEFT JOIN plantation_attendance pa
    ON pw.id = pa.worker_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});