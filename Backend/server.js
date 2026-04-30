const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ================= DATABASE =================

// ✅ Railway + Local support
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
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

// GET
app.get("/employees", (req, res) => {
  console.log("REQUEST RECEIVED"); // 👈 add this

  db.query("SELECT * FROM employees", (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json(err);
    }

    console.log("RESULT:", result); // 👈 add this
    res.json(result);
  });
});

// ADD
app.post("/employees", (req, res) => {
  const { name, memberid, NIC, basic_salary } = req.body;

  db.query(
    "INSERT INTO employees (name, memberid, NIC, basic_salary) VALUES (?, ?, ?, ?)",
    [name, memberid, NIC, basic_salary],
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

// UPDATE
app.put("/employees/:id", (req, res) => {
  const { name, memberid, NIC, basic_salary } = req.body;

  db.query(
    "UPDATE employees SET name=?, memberid=?, NIC=?, basic_salary=? WHERE id=?",
    [name, memberid, NIC, basic_salary, req.params.id],
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

// DELETE
app.delete("/employees/:id", (req, res) => {
  db.query(
    "DELETE FROM employees WHERE memberid=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.send(err);
      res.send({ success: true });
    }
  );
});

// ================= ATTENDANCE =================

// ADD
app.post("/attendance", (req, res) => {
  const { memberid, date, present, month } = req.body;

  db.query(
    "INSERT INTO attendance (memberid, date, present, month) VALUES (?, ?, ?, ?)",
    [memberid, date, present, month],
    (err, result) => {
      if (err) return res.send(err);
      res.send("Attendance Saved");
    }
  );
});

// GET
app.get("/attendance", (req, res) => {
  const query = `
    SELECT a.*, e.name
    FROM attendance a
    JOIN employees e ON a.memberid = e.memberid
  `;

  db.query(query, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// ================= ALLOWANCE =================

// ADD
app.post("/allowance", (req, res) => {
  const { memberid, month, amount } = req.body;

  db.query(
    "INSERT INTO allowances (memberid, month, amount) VALUES (?, ?, ?)",
    [memberid, month, amount],
    (err, result) => {
      if (err) return res.send(err);
      res.send("Allowance Saved");
    }
  );
});

// SUMMARY
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
      if (err) return res.send(err);
      res.json(result);
    });
  } else {
    db.query(query, (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    });
  }
});

// ================= PAYROLL =================

// ALL
app.get("/payroll", (req, res) => {
  const query = `
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

  db.query(query, (err, result) => {
    if (err) return res.send(err);

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
  });
});

// BY MONTH
app.get("/payroll/:month", (req, res) => {
  const month = req.params.month;

  const query = `
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
    WHERE att.month = ?
  `;

  db.query(query, [month], (err, result) => {
    if (err) return res.send(err);

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
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});