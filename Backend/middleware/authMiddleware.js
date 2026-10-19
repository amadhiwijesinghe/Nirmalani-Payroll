
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const isProduction = process.env.NODE_ENV === "production";

const db = mysql.createPool({
  host: isProduction
    ? process.env.RAILWAY_DB_HOST
    : process.env.DB_HOST,
  user: isProduction
    ? process.env.RAILWAY_DB_USER
    : process.env.DB_USER,
  password: isProduction
    ? process.env.RAILWAY_DB_PASSWORD
    : process.env.DB_PASSWORD,
  database: isProduction
    ? process.env.RAILWAY_DB_NAME
    : process.env.DB_NAME,
  port: Number(
    isProduction
      ? process.env.RAILWAY_DB_PORT || 3306
      : process.env.DB_PORT || 3306
  ),
  ...(isProduction ? { ssl: { rejectUnauthorized: false } } : {}),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [users] = await db.promise().execute(
      `SELECT username, role, is_active, account_status
       FROM app_users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    const admin = users[0];

    if (
      !admin ||
      admin.role !== "admin" ||
      !admin.is_active ||
      admin.account_status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message: "Administrator account is inactive or not approved",
      });
    }

    next();
  } catch (error) {
    console.error("Admin verification failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access",
    });
  }
};


module.exports = {
  verifyToken,
  verifyAdmin,
};
