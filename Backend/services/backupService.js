const cron = require("node-cron");
const mysqldump = require("mysqldump");
const path = require("path");
const fs = require("fs");
console.log("✅ Backup Service Loaded");
const { uploadBackup } = require("./s3Service");
const { sendBackupEmail } = require("./emailService");

const backupDir = path.join(__dirname, "../backups");

console.log("Backup Directory:", backupDir);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const createBackup = async () => {
  try {
    const now = new Date();

    const timestamp =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      "_" +
      String(now.getHours()).padStart(2, "0") +
      "-" +
      String(now.getMinutes()).padStart(2, "0") +
      "-" +
      String(now.getSeconds()).padStart(2, "0");

    const filePath = path.join(
      backupDir,
      `backup-${timestamp}.sql`
    );

    const isProduction = process.env.NODE_ENV === "production";

    const connection = {
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
    };

    if (
      !connection.host ||
      !connection.user ||
      !connection.database
    ) {
      throw new Error("Backup database configuration is incomplete");
    }

    await mysqldump({
      connection,
      dumpToFile: filePath,
    });

await uploadBackup(filePath, path.basename(filePath));

console.log("✅ Backup uploaded to S3");

fs.unlinkSync(filePath);
console.log("🗑️ Local backup deleted after successful upload");

  console.log(`✅ Backup Created: ${path.basename(filePath)}`);
  } catch (error) {
    console.error("Backup failed:", error.message);
    throw error;
  }
};

// Automatic backup on server startup is disabled for safety.

// Daily backup scheduler temporarily disabled during local testing.

// Export for manual backup
module.exports = { createBackup };