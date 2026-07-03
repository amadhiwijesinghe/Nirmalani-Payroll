require("dotenv").config();
const express = require("express");
const cors = require("cors");  
const mysql = require("mysql2");
const multer = require("multer");

const mysqldump = require("mysqldump");
const fs = require("fs");
const path = require("path");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const PDFDocument = require("pdfkit");
const app = express();

const s3 = new S3Client({
  region: process.env.AWS_REGION,

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(file, folder = "expenditure") {

  const fileName =
    `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  const key = `${folder}/${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return key;
}

async function getSignedS3Url(key) {

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 3600, // 1 hour
    }
  );

  return url;
}

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://nirmalani-payroll.vercel.app"
  ]
}));

app.use(express.json());

const uploadDir = path.join(
  __dirname,
  "uploads",
  "expenditure"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

console.log("Upload Directory:", uploadDir);

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(
  "/uploads",
  express.static("uploads")
);

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

app.get("/check-file", (req, res) => {

  const fs = require("fs");

  const filePath =
    path.join(
      __dirname,
      "uploads",
      "expenditure",
      "Sanuji Agro Bill - 15.jpeg"
    );

  res.json({
    exists: fs.existsSync(filePath),
    path: filePath
  });

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

app.get("/employees", async (req, res) => {

  try {

    const plantation = req.query.plantation;

    const [rows] =
      await db.promise().query(
        `
        SELECT *
        FROM employees
        WHERE LOWER(plantation) = LOWER(?)
        `,
        [plantation]
      );

    res.json(rows);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }
});

app.post("/employees", (req, res) => {
  const { name, memberid, NIC, basic_salary, plantation } = req.body;

  db.query(
    "INSERT INTO employees (name, memberid, NIC, basic_salary, plantation) VALUES (?, ?, ?, ?, ?)",
    [name, memberid, NIC, basic_salary, plantation],
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
  const { memberid, date, present, month, plantation } = req.body;

  const sql = `
    INSERT INTO attendance (memberid, date, present, month, plantation)
    VALUES (?, ?, ?, ?,?)
    ON DUPLICATE KEY UPDATE present = VALUES(present)
  `;

  db.query(sql, [memberid, date, present, month, plantation], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send("Saved");
  });
});

app.get("/attendance", (req, res) => {

    const plantation = req.query.plantation;

    const sql = `
        SELECT
            a.*,
            e.name
        FROM attendance a
        JOIN employees e
            ON a.memberid = e.memberid
        WHERE a.plantation = ?
        ORDER BY a.date DESC
    `;

    db.query(sql,[plantation],(err,result)=>{

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

// ================= ALLOWANCE =================

app.post("/allowance", (req, res) => {

  const {
    memberid,
    month,
    amount,
    plantation
  } = req.body;

  db.query(
    `INSERT INTO allowances
    (memberid, month, amount, plantation)
    VALUES (?, ?, ?, ?)`,
    [
      memberid,
      month,
      amount,
      plantation
    ],
    (err, result) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.send("Allowance Saved");

    }
  );

});

app.get("/allowance-summary", (req, res) => {

  const {
    month,
    plantation
  } = req.query;

  let query = `
    SELECT
      a.memberid,
      e.name,
      a.month,
      a.amount
    FROM allowances a
    JOIN employees e
      ON a.memberid = e.memberid
    WHERE a.plantation = ?
  `;

  const params = [plantation];

  if (month) {
    query += " AND a.month = ?";
    params.push(month);
  }

  db.query(query, params, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});

// ================= PAYROLL (FIXED) =================

app.get("/payroll/:month?", (req, res) => {

    const plantation = req.query.plantation;
    const month = req.params.month;

    let query = `
        SELECT
            e.memberid,
            e.name,
            e.basic_salary,
            COALESCE(a.total_allowance,0) AS total_allowance,
            ? AS month

        FROM employees e

        LEFT JOIN
        (
            SELECT
                memberid,
                SUM(amount) AS total_allowance
            FROM allowances
            WHERE plantation = ?
            AND month = ?
            GROUP BY memberid
        ) a
        ON e.memberid = a.memberid

        WHERE e.plantation = ?
        ORDER BY e.name
    `;

    db.query(
        query,
        [
            month || "",
            plantation,
            month || "",
            plantation
        ],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            const data = result.map(emp => {

                const basic = Number(emp.basic_salary || 0);

                const allowance = Number(emp.total_allowance || 0);

                const epf8 = basic * 0.08;
                const epf12 = basic * 0.12;
                const epf20 = epf8 + epf12;
                const etf = basic * 0.03;

                return {
                    ...emp,
                    epf_8: epf8.toFixed(2),
                    epf_12: epf12.toFixed(2),
                    epf_20: epf20.toFixed(2),
                    etf: etf.toFixed(2),
                    deduction: epf8.toFixed(2),
                    net_salary: (basic + allowance - epf8).toFixed(2)
                };

            });

            res.json(data);

        }
    );

});



// ================= PLANTATION WORKERS =================
// 🌿 Plantation Workers
app.get('/plantation-workers', (req, res) => {

  const plantation = req.query.plantation;

  db.query(
    "SELECT * FROM plantation_workers WHERE plantation = ?",
    [plantation],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

app.post('/plantation-workers', (req, res) => {

  const { name, epf_no, plantation } = req.body;

  db.query(
    "INSERT INTO plantation_workers (name, epf_no, plantation) VALUES (?, ?, ?)",
    [name, epf_no, plantation],
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
    SELECT
    SUM(
      CASE
        WHEN DAYOFWEEK(date)=1
        THEN 1.5
        ELSE 1
      END
    ) AS days
    FROM plantation_daily_attendance
    WHERE worker_id = ?
    AND DATE_FORMAT(date,'%Y-%m') = ?
    AND status='present'
  `;

  db.query(sql, [worker_id, month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});


// 🌿 Combined Data
app.get('/plantation-data', (req, res) => {

  const plantation = req.query.plantation;

  const sql = `
    SELECT
      pw.id AS worker_id,
      pw.name,
      pw.epf_no,
      pw.plantation,

      IFNULL(MIN(pda.rate_per_day),0) AS rate_per_day,
      IFNULL(MAX(pa.allowance),0) AS allowance,

      SUM(
        CASE
          WHEN DAYOFWEEK(pda.date)=1
          THEN 1.5
          ELSE 1
        END
      ) AS days_worked,

      SUM(pda.rate_per_day) AS amount,

      DATE_FORMAT(pda.date,'%Y-%m') AS month

    FROM plantation_workers pw

    JOIN plantation_daily_attendance pda
      ON pw.id = pda.worker_id

    LEFT JOIN plantation_attendance pa
      ON pa.worker_id = pw.id
      AND pa.month = DATE_FORMAT(pda.date,'%Y-%m')

    WHERE pda.status='present'
    AND pw.plantation = ?

    GROUP BY
      pw.id,
      pw.name,
      pw.epf_no,
      DATE_FORMAT(pda.date,'%Y-%m')
  `;

  db.query(sql,[plantation],(err,result)=>{
    if(err){
      return res.status(500).json(err);
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
      pda.id,
      pda.worker_id,
      pw.name,
      pda.date,
      pda.rate_per_day

    FROM plantation_daily_attendance pda

    JOIN plantation_workers pw
      ON pw.id = pda.worker_id

    WHERE pda.worker_id = ?
    AND pda.date LIKE CONCAT(?, '%')

    ORDER BY pda.date ASC
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

// WEEKLY REPORT
app.get("/plantation-weekly-report", (req, res) => {

  const { weekStart, weekEnd } = req.query;

  const sql = `
    SELECT
      pw.name,
      pw.epf_no,
      pda.date,
      pda.rate_per_day

    FROM plantation_daily_attendance pda

    JOIN plantation_workers pw
      ON pw.id = pda.worker_id

    WHERE DATE(pda.date)
      BETWEEN ? AND ?

    ORDER BY pda.date ASC
  `;

  db.query(
    sql,
    [weekStart, weekEnd],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

app.get(
  "/dashboard/plantation-total-required/:month",
  (req, res) => {

    const month = req.params.month;
    const plantation = req.query.plantation;

    const sql = `
      SELECT
        SUM(pda.rate_per_day) AS amount,
        IFNULL(MAX(pa.allowance),0) AS allowance

      FROM plantation_workers pw

      JOIN plantation_daily_attendance pda
        ON pw.id = pda.worker_id

      LEFT JOIN plantation_attendance pa
        ON pa.worker_id = pw.id
        AND pa.month = DATE_FORMAT(pda.date,'%Y-%m')

      WHERE
      pda.status='present'
      AND DATE_FORMAT(pda.date,'%Y-%m') = ?
      AND pw.plantation = ?

      GROUP BY pw.id
    `;

    db.query(sql,[month, plantation],(err,result)=>{

      if (err) {
        console.log("PLANTATION SUMMARY ERROR:", err);
        return res.status(500).json(err);
    }

      let totalRequired = 0;

      result.forEach(row=>{

        const gross =
          Number(row.amount || 0) +
          Number(row.allowance || 0);

        const epf8 = gross * 0.08;
        const epf12 = gross * 0.12;
        const epf20 = epf8 + epf12;
        const etf = gross * 0.03;

        const balance =
          gross - epf8;

        totalRequired +=
          balance +
          epf20 +
          etf;
      });

      res.json({
        totalRequired
      });
    });
  }
);


// ================= RUBBER TAPPERS ============
//ADD

app.get("/rubber-tappers", (req, res) => {

    const { plantation } = req.query;

    db.query(
        "SELECT * FROM rubber_tappers WHERE plantation = ?",
        [plantation],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});
app.post('/rubber-tappers', (req, res) => {

  const {

    name,

    plantation,

    worker_category,

    epf_no,

    epf_enabled

  } = req.body;

  db.query(
    "INSERT INTO rubber_tappers (name, plantation, worker_category, epf_no, epf_enabled) VALUES (?, ?, ?, ?, ?)",
    [name, plantation, worker_category, epf_no, epf_enabled],
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
        rt.worker_category,
        rt.epf_no,
        rt.epf_enabled,

        rta.liter,
        rta.brc,
        rta.kg,
        rta.rate,
        rta.allowance,
        rta.total_earning,
        rta.date,
        DATE_FORMAT(rta.date,'%Y-%m') AS month,
        rta.status

    FROM rubber_tappers_attendance rta

    JOIN rubber_tappers rt
    ON rt.id = rta.worker_id

    WHERE rt.plantation = ?

    ORDER BY rta.date DESC
    `;

  db.query(sql, [req.query.plantation], (err, result) => {

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

// SUMMARY
app.get(
  "/dashboard/rubber-summary/:month",
  (req, res) => {

    const month =
      req.params.month;

    const plantation = req.query.plantation;

    const sql = `
    SELECT
    SUM(rta.total_earning) AS total

    FROM rubber_tappers_attendance rta

    JOIN rubber_tappers rt
    ON rt.id = rta.worker_id

    WHERE
    DATE_FORMAT(rta.date,'%Y-%m') = ?
    AND rt.plantation = ?
        `;

    db.query(
      sql,
      [month, plantation],
      (err, result) => {

        if (err) {
          return res
            .status(500)
            .json(err);
        }

        res.json({
          totalRequired:
            Number(
              result[0].total || 0
            )
        });

      }
    );
  }
);

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

    WHERE pw.plantation = ?
    
    ORDER BY tc.date DESC
  ` [req.query.plantation];

  db.query(sql, [req.query.plantation], (err, result) => {

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

// TEA DISTRIBUTION
app.post("/tea-distribution", (req,res)=>{

  const {
    distribution_date,
    company,
    kg,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO tea_distribution
    (
      distribution_date,
      company,
      kg,
      plantation
    )
    VALUES (?,?,?,?)
    `,
    [
      distribution_date,
      company,
      kg,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );

});

app.get("/tea-distribution",(req,res)=>{

  const plantation =
    req.query.plantation;

  db.query(
    `
    SELECT *
    FROM tea_distribution
    WHERE plantation = ?
    ORDER BY distribution_date DESC
    `,
    [plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );

});

// ================ CINAMMON =====================

// ADD CINNAMON COLLECTION
app.post("/cinnamon-collection", (req, res) => {

  const {
    worker_id,
    date,
    kg,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO cinnamon_collection
    (
      worker_id,
      date,
      kg,
      plantation
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      worker_id,
      date,
      kg,
      plantation
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Cinnamon Collection Saved"
      });
    }
  );
});

// GET CINNAMON COLLECTION
app.get("/cinnamon-collection", (req, res) => {

  const plantation =
    req.query.plantation;

  db.query(
    `
    SELECT
      cc.id,
      cc.worker_id,
      cc.date,
      cc.kg,
      pw.name,
      pw.epf_no

    FROM cinnamon_collection cc

    JOIN plantation_workers pw
      ON pw.id = cc.worker_id

    WHERE pw.plantation = ?

    ORDER BY cc.date DESC
    `,
    [plantation],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// UPDATE CINNAMON COLLECTION
app.put("/cinnamon-collection/:id", (req, res) => {

  const { kg } = req.body;

  db.query(
    `
    UPDATE cinnamon_collection
    SET kg = ?
    WHERE id = ?
    `,
    [
      kg,
      req.params.id
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
});

// DELETE CINNAMON COLLECTION
app.delete("/cinnamon-collection/:id", (req, res) => {

  db.query(
    `
    DELETE FROM cinnamon_collection
    WHERE id = ?
    `,
    [req.params.id],
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

// කෝට උර
// ADD KOTA URA
app.post("/cinnamon-kota-ura", (req, res) => {

  const {
    date,
    quantity,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO cinnamon_kota_ura
    (
      date,
      quantity,
      plantation
    )
    VALUES (?, ?, ?)
    `,
    [
      date,
      quantity,
      plantation
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "කෝට උර Saved"
      });
    }
  );
});

// GET KOTA URA
app.get("/cinnamon-kota-ura", (req, res) => {

  const plantation =
    req.query.plantation;

  db.query(
    `
    SELECT *
    FROM cinnamon_kota_ura
    WHERE plantation = ?
    ORDER BY date DESC
    `,
    [plantation],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// තැන්පත් කිරීම
// ADD DEPOSIT
app.post("/cinnamon-deposit", (req, res) => {

  const {
    date,
    quantity,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO cinnamon_deposit
    (
      date,
      quantity,
      plantation
    )
    VALUES (?, ?, ?)
    `,
    [
      date,
      quantity,
      plantation
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Deposit Saved"
      });
    }
  );
});

// GET DEPOSIT
app.get("/cinnamon-deposit", (req, res) => {

  const plantation =
    req.query.plantation;

  db.query(
    `
    SELECT *
    FROM cinnamon_deposit
    WHERE plantation = ?
    ORDER BY date DESC
    `,
    [plantation],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ================= RUBBER DISPATCH =================

// ADD DISPATCH
app.post("/rubber-dispatch", (req, res) => {

  const {
    liters_sent,
    date,
    plantation
  } = req.body;

  const sql = `
    INSERT INTO rubber_dispatch
    (
      liters_sent,
      date,
      plantation
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [
      liters_sent,
      date,
      plantation
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
    WHERE plantation = ?
    ORDER BY date DESC
  `;

  db.query(
    sql,
    [req.query.plantation],
    (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);
    }
);
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
    date,
    plantation
  } = req.body;

  const sql = `
    INSERT INTO rubber_collection
    (
      liters_collected,
      date,
      plantation
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [
      liters_collected,
      date,
      plantation
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
    WHERE plantation = ?
    ORDER BY date DESC
  `;

  db.query(
    sql,
    [req.query.plantation],
    (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);
    }
);
});

// ADD OTTAPALU
app.post("/ottapalu", (req, res) => {

  const {
    quantity,
    collection_date,
    plantation
  } = req.body;

  const sql = `
    INSERT INTO ottapalu_collection
    (
      quantity,
      collection_date,
      plantation
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [
      quantity,
      collection_date,
      plantation
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Ottapalu Saved"
      });
    }
  );
});

// GET OTTAPALU
app.get("/ottapalu", (req, res) => {

  const plantation =
    req.query.plantation;

  const sql = `
    SELECT *
    FROM ottapalu_collection
    WHERE plantation = ?
    ORDER BY collection_date DESC
  `;

  db.query(
    sql,
    [plantation],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// ================ COCONUT ===================

// SAVE COCONUT
app.post("/coconut-collection", (req,res)=>{

  const {
    collection_date,
    quantity,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO coconut_collection
    (
      collection_date,
      quantity,
      plantation
    )
    VALUES (?, ?, ?)
    `,
    [
      collection_date,
      quantity,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true
      });

    }
  );

});

// GET COCONUT

app.get("/coconut-collection",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM coconut_collection
    WHERE plantation=?
    ORDER BY collection_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// DELETE COCONUT
app.delete("/coconut-collection/:id", (req,res)=>{

  db.query(
    `
    DELETE FROM coconut_collection
    WHERE id=?
    `,
    [req.params.id],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true
      });

    }
  );

});

// SALES
app.post("/coconut-sales", (req,res)=>{

  const {
    sale_date,
    quantity_sold,
    price,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO coconut_sales
    (
      sale_date,
      quantity_sold,
      price,
      plantation
    )
    VALUES (?,?,?,?)
    `,
    [
      sale_date,
      quantity_sold,
      price,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

app.get("/coconut-sales",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM coconut_sales
    WHERE plantation=?
    ORDER BY sale_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// FREE GIVING 
app.post("/coconut-free-giving",(req,res)=>{

  const {
    free_date,
    quantity,
    note,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO coconut_free_giving
    (
      free_date,
      quantity,
      note,
      plantation
    )
    VALUES (?,?,?,?)
    `,
    [
      free_date,
      quantity,
      note,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

app.get("/coconut-free-giving",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM coconut_free_giving
    WHERE plantation=?
    ORDER BY free_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// ================ PADDY =======================

// SAVE PADDY
app.post("/paddy-collection", (req,res)=>{

  const {
    collection_date,
    quantity,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO paddy_collection
    (
      collection_date,
      quantity,
      plantation
    )
    VALUES (?, ?, ?)
    `,
    [
      collection_date,
      quantity,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true
      });

    }
  );

});

// GET PADDY

app.get("/paddy-collection",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM paddy_collection
    WHERE plantation=?
    ORDER BY collection_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// DELETE PADDY
app.delete("/paddy-collection/:id", (req,res)=>{

  db.query(
    `
    DELETE FROM paddy_collection
    WHERE id=?
    `,
    [req.params.id],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({
        success:true
      });

    }
  );

});

// SALES
app.post("/paddy-sales", (req,res)=>{

  const {
    sale_date,
    quantity_sold,
    price,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO paddy_sales
    (
      sale_date,
      quantity_sold,
      price,
      plantation
    )
    VALUES (?,?,?,?)
    `,
    [
      sale_date,
      quantity_sold,
      price,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

app.get("/paddy-sales",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM paddy_sales
    WHERE plantation=?
    ORDER BY sale_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// FREE GIVING 
app.post("/paddy-free-giving",(req,res)=>{

  const {
    free_date,
    quantity,
    note,
    plantation
  } = req.body;

  db.query(
    `
    INSERT INTO paddy_free_giving
    (
      free_date,
      quantity,
      note,
      plantation
    )
    VALUES (?,?,?,?)
    `,
    [
      free_date,
      quantity,
      note,
      plantation
    ],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

app.get("/paddy-free-giving",(req,res)=>{

  db.query(
    `
    SELECT *
    FROM paddy_free_giving
    WHERE plantation=?
    ORDER BY free_date DESC
    `,
    [req.query.plantation],
    (err,result)=>{

      if(err){
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});

// ================= CASUAL WORKERS =========
app.get("/casual-workers-data", (req, res) => {

  const plantation = req.query.plantation;

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
    ON cw.id=cwa.worker_id

    WHERE cw.plantation = ?

    GROUP BY
      cw.id,
      cwa.month

    ORDER BY
      cwa.month DESC
  `;

  db.query(sql, [plantation], (err, result) => {

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

      FROM casual_worker_attendance cwa

      JOIN casual_workers cw
      ON cw.id=cwa.worker_id

      WHERE
      cwa.worker_id=?
      AND cwa.month=?
      AND cw.plantation=?
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
app.get("/casual-workers", (req,res)=>{

    const plantation = req.query.plantation;

    db.query(
        `
        SELECT *
        FROM casual_workers
        WHERE plantation = ?
        ORDER BY id DESC
        `,
        [plantation],
        (err,result)=>{

            if(err){
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
    INSERT INTO casual_workers (name, plantation)
    VALUES (?,?)
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

//SUMMARY
app.get("/dashboard/casual-summary/:month", (req, res) => {

    const month = req.params.month;
    const plantation = req.query.plantation;

    const sql = `
        SELECT
            COALESCE(SUM(ca.total_earning),0) AS total

        FROM casual_worker_attendance ca

        JOIN casual_workers cw
            ON cw.id = ca.worker_id

        WHERE ca.month = ?
        AND cw.plantation = ?
    `;

    db.query(sql, [month, plantation], (err, result) => {

        if (err) {
          console.log("CASUAL SUMMARY ERROR:", err);
          return res.status(500).json(err);
      }

        res.json({
            totalRequired: Number(result[0].total || 0)
        });

    });

});

// ======================= ATTENDANCE REGISTER ======================
// LOAD ALL WORKERS
app.get("/attendance-register/workers", async (req, res) => {

    try {

        const plantation = req.query.plantation;

        const [rows] = await db.promise().query(
            `
            SELECT
                id AS worker_id,
                name,
                epf_no,
                'plantation' AS worker_type
            FROM plantation_workers
            WHERE plantation = ?

            UNION ALL

            SELECT
                id AS worker_id,
                name,
                NULL AS epf_no,
                'rubber' AS worker_type
            FROM rubber_tappers
            WHERE plantation = ?

            UNION ALL

            SELECT
                id AS worker_id,
                name,
                NULL AS epf_no,
                'casual' AS worker_type
            FROM casual_workers
            WHERE plantation = ?

            ORDER BY
                CASE
                    WHEN epf_no IS NULL THEN 1
                    ELSE 0
                END,
                CAST(epf_no AS UNSIGNED),
                name
            `,
            [
                plantation,
                plantation,
                plantation
            ]
        );

        res.json(rows);

    } catch (err) {

        console.log(err);

        res.status(500).json(err);

    }

});


// LOAD MONTHLY ATTENDANCE
app.get("/attendance-register", async (req, res) => {

    try {

        const { plantation, month, year } = req.query;

        const [rows] = await db.promise().query(
            `
            SELECT
              worker_id,
              worker_type,
              attendance_date,
              is_present,
              attendance_value
            FROM attendance_register
            WHERE plantation = ?
            AND MONTH(attendance_date)=?
            AND YEAR(attendance_date)=?
            `,
            [
                plantation,
                month,
                year
            ]
        );

        res.json(rows);

    } catch (err) {

        console.log(err);

        res.status(500).json(err);

    }

});

// SAVE MONTHLY ATTENDANCE
app.post("/attendance-register", async (req, res) => {

    try {

        const attendance = req.body;

        for (const row of attendance) {

            await db.promise().query(
                `
                INSERT INTO attendance_register
                (
                    worker_id,
                    worker_type,
                    attendance_date,
                    plantation,
                    is_present,
                    attendance_value
                )
                VALUES (?, ?, ?, ?, ?, ?)

                ON DUPLICATE KEY UPDATE
                    is_present = VALUES(is_present),
                    attendance_value = VALUES(attendance_value)
                `,
                [
                  row.worker_id,
                  row.worker_type,
                  row.attendance_date,
                  row.plantation,
                  row.is_present,
                  row.attendance_value
              ]
            );

        }

        res.json({
            success: true,
            message: "Attendance Saved Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json(err);

    }

});

// ATTENDANCE STATUS
app.get("/attendance-register/status", async (req, res) => {

    try {

        const {
            plantation,
            month,
            year
        } = req.query;

        const [rows] = await db.promise().query(
            `
            SELECT is_finalized
            FROM attendance_register_status
            WHERE plantation=?
            AND month=?
            AND year=?
            `,
            [
                plantation,
                month,
                year
            ]
        );

        if (rows.length === 0) {

            return res.json({
                is_finalized: 0
            });

        }

        res.json(rows[0]);

    } catch (err) {

        console.log(err);

        res.status(500).json(err);

    }

});

// POST FINALIZED ATTENDANCE
app.post("/attendance-register/finalize", async (req, res) => {

    try {

        const {
            plantation,
            month,
            year
        } = req.body;

        await db.promise().query(
            `
            INSERT INTO attendance_register_status
            (
                plantation,
                month,
                year,
                is_finalized,
                finalized_at
            )

            VALUES
            (
                ?,?,?,1,NOW()
            )

            ON DUPLICATE KEY UPDATE

                is_finalized=1,
                finalized_at=NOW()
            `,
            [
                plantation,
                month,
                year
            ]
        );

        res.json({
            success:true
        });

    } catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

// ================= INCOME ================
// GET INCOME
app.get("/income", (req, res) => {

  const plantation = req.query.plantation;

  db.query(
    `
    SELECT *
    FROM income
    WHERE plantation = ?
    ORDER BY date DESC
    `,
    [plantation],
    (err, result) => {

      if (err) {
        console.log("INCOME ERROR:", err);
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
    date,
    plantation
  } = req.body;

  const sql = `
    INSERT INTO income
    (
      category,
      amount,
      note,
      date,
      plantation
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      category,
      amount,
      note,
      date,
      plantation
    ],
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

// DELETE INCOME
app.delete("/income/:id", (req,res)=>{

  db.query(
    "DELETE FROM income WHERE id=?",
    [req.params.id],
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json({
        success:true
      });
    }
  );
});

// UPDATE INCOME
app.put("/income/:id", (req, res) => {

  const {
    category,
    amount,
    note,
    date,
    plantation
  } = req.body;

  db.query(
    `
    UPDATE income
    SET
      category=?,
      amount=?,
      note=?,
      date=?,
      plantation=?
    WHERE id=?
    `,
    [
      category,
      amount,
      note,
      date,
      plantation,
      req.params.id
    ],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true
      });

    }
  );

});

// ================ EXPENDITURE ============
app.get("/expenditure", async (req, res) => {
  try {

    const plantation = req.query.plantation;

    const [result] = await db.promise().query(
      `SELECT *
       FROM expenditure
       WHERE plantation = ?
       ORDER BY date DESC, id DESC`,
      [plantation]
    );

    console.log("Rows found:", result.length);

    const updatedResults = await Promise.all(
      result.map(async (row) => {
        console.log("Processing ID:", row.id);
        console.log("Photos:", row.photos);

        return {
          ...row,

          photos: row.photos
            ? await Promise.all(

                JSON.parse(row.photos)

                  .filter(photo => photo) // removes null

                  .map(async (photo) => {

                    // Old local uploads
                    if (!photo.startsWith("expenditure/")) {

                      return {
                        key: photo,
                        url: null
                      };

                    }

                    // New S3 uploads
                    return {
                      key: photo,
                      url: await getSignedS3Url(photo)
                    };

                  })

              )
            : []
        };
      })
    );

    res.json(updatedResults);

  } catch (err) {
    console.error("EXPENDITURE ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

// ADD EXPENDITURE
app.post(
  "/expenditure",
  upload.array("photos", 10),
  async (req,res)=>{

    const photos = [];
    console.log("Files:", req.files);

      if (req.files) {

        console.log("Files received:", req.files);

        for (const file of req.files) {

          console.log("Uploading file:", file.originalname);

          const key = await uploadToS3(file);

          console.log("Returned key:", key);

          console.log("Uploaded successfully. S3 key:", key);

          photos.push(key);

        }

      }

    const {
      bank_account,
      category,
      sub_category,
      amount,
      note,
      transaction_type,
      date,
      plantation
    } = req.body;

  const sql = `
    INSERT INTO expenditure
    (
      bank_account,
      category,
      sub_category,
      amount,
      note,
      date,
      transaction_type,
      photos,
      plantation
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  db.query(
    sql,
    [

      bank_account || null, 
      category || null,

      sub_category || null,

      Number(amount || 0),

      note || null,

      date || null,

      transaction_type || "Expense",
      
      JSON.stringify(photos),
      
      plantation
    ],
    (err,result)=>{

      if(err){

        console.log(
          "EXPENDITURE ERROR:",
          err
        );

        return res
          .status(500)
          .json({
            error: err.message
          });
      }

      res.json({
        success:true,
        message:"Expense Added"
      });
    }
  );
});

// DELETE EXPENDITURE
app.delete("/expenditure/:id", (req,res)=>{

  db.query(
    "DELETE FROM expenditure WHERE id=?",
    [req.params.id],
    (err,result)=>{

      if(err){

        return res.status(500).json(err);
      }

      res.json({
        success:true
      });
    }
  );
});

// UPDATE EXPENDITURE
app.put(
  "/expenditure/:id",
  upload.array("photos", 10),
  async (req, res) => {

    const {
      bank_account,
      category,
      sub_category,
      amount,
      note,
      transaction_type,
      date,
      plantation
    } = req.body;

    db.query(
      "SELECT photos FROM expenditure WHERE id=?",
      [req.params.id],
      async (err, result) => {

        if (err) {
          return res.status(500).json(err);
        }

        let existingPhotos = [];

        if (
          result.length > 0 &&
          result[0].photos
        ) {
          existingPhotos = JSON.parse(
            result[0].photos
          );
        }

        const newPhotos = [];

          if (req.files) {
            for (const file of req.files) {
              const key = await uploadToS3(file);
              newPhotos.push(key);
            }
          }

        const allPhotos = [
          ...existingPhotos,
          ...newPhotos
        ];

        const sql = `
          UPDATE expenditure
          SET
            bank_account=?,
            category=?,
            sub_category=?,
            amount=?,
            note=?,
            date=?,
            transaction_type=?,
            photos=?,
            plantation=?
          WHERE id=?
        `;

        db.query(
          sql,
          [
            bank_account,
            category,
            sub_category,
            amount,
            note,
            date,
            transaction_type,
            JSON.stringify(allPhotos),
            plantation,
            req.params.id
          ],
          (err) => {

            if (err) {
              return res.status(500).json(err);
            }

            res.json({
              success: true
            });
          }
        );
      }
    );
  }
);

// ================ FINANCIAL DASHBOARD ==============

//Total Income

app.get("/dashboard/total-income/:month", (req,res)=>{

    const month = req.params.month;
    const plantation = req.query.plantation;

    const sql = `
        SELECT SUM(amount) AS total
        FROM income
        WHERE DATE_FORMAT(date,'%Y-%m') = ?
        AND plantation = ?
    `;

    db.query(
        sql,
        [month, plantation],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                total: result[0].total || 0
            });

        }
    );

});

// Total Expenditure

app.get("/dashboard/total-expenditure/:month", (req, res) => {

    const month = req.params.month;
    const plantation = req.query.plantation;

    const sql = `
        SELECT
            COALESCE(SUM(amount),0) AS total
        FROM expenditure
        WHERE DATE_FORMAT(date,'%Y-%m') = ?
        AND plantation = ?
        AND LOWER(transaction_type) = 'expense'
    `;

    db.query(sql,[month, plantation],(err,result)=>{

        if(err){
            console.log(err);
            return res.status(500).json(err);
        }

        res.json({
            total: Number(result[0].total || 0)
        });

    });

});

// Monthly Profit & Loss
app.get("/dashboard/monthly-profit-loss", (req, res) => {

  const plantation=req.query.plantation;

  const sql = `

    SELECT

      months.month,

      COALESCE(i.income,0) AS income,

      COALESCE(e.expense,0) AS expense,

      COALESCE(i.income,0)
      -
      COALESCE(e.expense,0)
      AS profit

    FROM

    (

      SELECT DATE_FORMAT(date,'%Y-%m')
      AS month
      FROM income
      WHERE plantation=?

      UNION

      SELECT DATE_FORMAT(date,'%Y-%m')
      AS month
      FROM expenditure
      WHERE plantation=?

    ) months

    LEFT JOIN

    (
      SELECT
      DATE_FORMAT(date,'%Y-%m')
      AS month,

      SUM(amount)
      AS income

      FROM income
      WHERE plantation=?

      GROUP BY month

    ) i

    ON months.month = i.month

    LEFT JOIN

    (
      SELECT
        DATE_FORMAT(date,'%Y-%m') AS month,
        SUM(amount) AS expense
      FROM expenditure
      WHERE transaction_type = 'Expense'
      AND plantation = ?
      GROUP BY month

    ) e

    ON months.month = e.month

    ORDER BY months.month DESC
  `;

  db.query(
    sql,
    [plantation, plantation, plantation, plantation],
    (err, result) => {

      if (err) return res.status(500).json(err);

      res.json(result);
    });

});

// MONTHLY FINANCIAL REPORT 
app.get(
  "/dashboard/monthly-financial-report/:month",
  async (req, res) => {

    const plantation=req.query.plantation;

    try {

      const { month } = req.params;

      const [incomeRows] =
        await db.promise().query(
          `
          SELECT
            category,
            SUM(amount) amount
          FROM income
          WHERE DATE_FORMAT(date,'%Y-%m')=?
          AND plantation=?
          GROUP BY category
          `,
          [month, plantation]
        );

      const [expenseRows] =
        await db.promise().query(
          `
          SELECT
            category,
            SUM(amount) amount
          FROM expenditure
          WHERE DATE_FORMAT(date,'%Y-%m') = ?
          AND transaction_type = 'Expense'
          AND plantation = ?
          GROUP BY category
          `,
          [month, plantation]
        );

      res.json({
        income: incomeRows,
        expenditure: expenseRows
      });

    } catch (err) {

      console.error(err);

      res.status(500).json(err);
    }
});

app.get(
  "/dashboard/monthly-cashflow",
  async (req,res) => {

    try {

      const plantation = req.query.plantation;

      const [rows] =
        await db.promise().query(
          `
          SELECT
            DATE_FORMAT(date,'%Y-%m') AS month,
            transaction_type,
            amount
          FROM expenditure
          WHERE plantation = ?
          ORDER BY date ASC
          `,
          [plantation]
        );

      const monthly = {};

      rows.forEach(row => {

        if (!monthly[row.month]) {

          monthly[row.month] = {
            received: 0,
            expense: 0
          };
        }

        if (
          row.transaction_type === "Received"
        ) {

          monthly[row.month].received +=
            Number(row.amount);

        } else {

          monthly[row.month].expense +=
            Number(row.amount);

        }

      });

      let previousClosing = 0;

      const result = [];

      Object.keys(monthly)
        .sort()
        .forEach(month => {

          const opening =
            previousClosing;

          const received =
            monthly[month].received;

          const expense =
            monthly[month].expense;

          const closing =
            opening +
            received -
            expense;

          result.push({
            month,
            opening,
            received,
            expense,
            closing
          });

          previousClosing =
            closing;
        });

      res.json(result);

    } catch(err) {

      console.log(err);

      res.status(500).json(err);
    }
});

app.get(
  "/dashboard/monthly-cashflow/:month",
  async (req,res) => {

    const plantation=req.query.plantation;

    try {

      const month = req.params.month;

      const monthStart =
        `${month}-01`;

      const [[openingRow]] =
        await db.promise().query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS opening
          FROM expenditure
          WHERE DATE_FORMAT(date,'%Y-%m')=?
          AND plantation=?
          AND transaction_type = 'Opening Balance'
          AND bank_account = 'Sampath'
          `,
          [month, plantation]
        );

      const [[sampathReceivedRow]] =
        await db.promise().query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS received
          FROM expenditure
          WHERE DATE_FORMAT(date,'%Y-%m') = ?
          AND plantation=?
          AND transaction_type = 'Received'
          AND bank_account = 'Sampath'
          `,
          [month, plantation]
        );

      const [[sampathExpenseRow]] =
        await db.promise().query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS expense
          FROM expenditure
          WHERE DATE_FORMAT(date,'%Y-%m') = ?
          AND plantation=?
          AND transaction_type = 'Expense'
          AND bank_account = 'Sampath'
          `,
          [month, plantation]
        );

      const [[receivedRow]] =
        await db.promise().query(
          `
          SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS received
          FROM expenditure
          WHERE DATE_FORMAT(date,'%Y-%m')=?
          AND plantation=?
          AND transaction_type='Received'
          AND bank_account='Sampath'
          `,
          [month, plantation]
        );

     const [[expenseRow]] =
      await db.promise().query(
        `
        SELECT
          COALESCE(SUM(amount),0) AS expense
        FROM expenditure
        WHERE DATE_FORMAT(date,'%Y-%m')=?
        AND plantation=?
        AND transaction_type='Expense'
        AND bank_account='Sampath'
        `,
        [month, plantation]
      );

      const opening =
        Number(openingRow.opening);

      const received =
        Number(receivedRow.received);

      const expense =
        Number(expenseRow.expense);

      const closing =
        Number(openingRow.opening) +
        Number(sampathReceivedRow.received) -
        Number(sampathExpenseRow.expense);

      res.json({
        opening: Number(openingRow.opening),
        received,
        closing,
      });

    } catch(err){

      console.log(err);

      res.status(500).json(err);
    }
});

// ALL WORKER REPORT
app.get("/dashboard/all-worker-salary-report/:month", async (req, res) => {

  const plantation = req.query.plantation;
  const month = req.params.month;

  try {

    let report = [];

    // ================= PLANTATION =================

    const plantationSql = `
      SELECT
        pw.name,
        pw.epf_no,
        DATE_FORMAT(pda.date,'%Y-%m') AS month,

        SUM(
          CASE
            WHEN DAYOFWEEK(pda.date)=1
            THEN 1.5
            ELSE 1
          END
        ) AS days,

        MIN(pda.rate_per_day) AS rate,

        SUM(pda.rate_per_day) AS amount,

        IFNULL(MAX(pa.allowance),0) AS allowance

      FROM plantation_workers pw

      JOIN plantation_daily_attendance pda
        ON pw.id = pda.worker_id

      LEFT JOIN plantation_attendance pa
        ON pa.worker_id = pw.id
        AND pa.month = DATE_FORMAT(pda.date,'%Y-%m')

      WHERE pda.status='present'
      AND DATE_FORMAT(pda.date,'%Y-%m') = ?
      AND pw.plantation = ?

      GROUP BY
        pw.id,
        pw.epf_no,
        DATE_FORMAT(pda.date,'%Y-%m')
    `;

    const PlantationWorkers = await new Promise((resolve, reject) => {

      db.query(
        plantationSql,
        [month, plantation],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

    });

    PlantationWorkers.forEach(row => {

      report.push({
        type: "Plantation",
        epf_no: row.epf_no,
        name: row.name,
        month: row.month,
        days: row.days,
        rate: row.rate,
        amount: row.amount,
        allowance: row.allowance
      });

    });

    // ================= CASUAL =================

  
    const casualSql = `
      SELECT
        cw.name,
        cwa.month,

        COUNT(*) AS days,

        MAX(cwa.daily_rate) AS rate,

        SUM(cwa.total_earning) AS amount,

        SUM(cwa.allowance) AS allowance

      FROM casual_worker_attendance cwa

      JOIN casual_workers cw
        ON cw.id = cwa.worker_id

      WHERE cwa.month = ?
      AND cw.plantation=?

      GROUP BY cw.id,cwa.month
    `;

    const casual = await new Promise((resolve, reject) => {

      db.query(
        casualSql,
        [month, plantation],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

    });

    casual.forEach(row => {

      report.push({
        type: "Casual",
        name: row.name,
        month: row.month,
        days: row.days,
        rate: row.rate,
        amount: row.amount,
        allowance: row.allowance
      });

    });

    // ================= RUBBER =================

    const rubberSql = `
      SELECT

        rt.name,

        DATE_FORMAT(rta.date,'%Y-%m') AS month,

        COUNT(*) AS days,

        MAX(rta.rate) AS rate,

        SUM(rta.total_earning) AS amount,

        SUM(rta.allowance) AS allowance

      FROM rubber_tappers_attendance rta

      JOIN rubber_tappers rt
        ON rt.id = rta.worker_id

      WHERE DATE_FORMAT(rta.date,'%Y-%m') = ?
      AND rt.plantation=?

      GROUP BY
        rt.id,
        DATE_FORMAT(rta.date,'%Y-%m')
    `;

    const rubber = await new Promise((resolve, reject) => {

      db.query(
        rubberSql,
        [month, plantation],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

    });

    rubber.forEach(row => {

      report.push({
        type: "Rubber",
        name: row.name,
        month: row.month,
        days: row.days,
        rate: row.rate,
        amount: row.amount,
        allowance: row.allowance
      });

    });

    report.sort((a, b) => {

    const typeOrder = {
      Plantation: 1,
      Casual: 2,
      Rubber: 3
    };

    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }

    return String(a.epf_no || "").localeCompare(
      String(b.epf_no || ""),
      undefined,
      { numeric: true }
    );
  });

    res.json(report);

  } catch (err) {

    console.log("REPORT ERROR:", err);

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

