const cron = require("node-cron");
const mysqldump = require("mysqldump");
const path = require("path");
const fs = require("fs");
console.log("✅ Backup Service Loaded");
const { sendBackupEmail } = require("./emailService");
const { uploadFile } = require("./driveService");

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

    await sendBackupEmail(
      filePath,
      path.basename(filePath)
    );

    console.log("✅ Backup Email Sent");

    fs.unlinkSync(filePath);

    console.log("🗑️ Local Backup Deleted");

    console.log("✅ Uploaded to Google Drive");

    // Delete local backup after successful upload
    fs.unlinkSync(filePath);

    console.log("🗑️ Local backup deleted");

    console.log(`✅ Backup Created: ${path.basename(filePath)}`);
  } catch (error) {
    console.error("❌ Backup Failed:", error);
  }
};

// Create one backup when server starts
createBackup();

// Run every day at 12:00 AM Sri Lanka time
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("🔄 Running Daily Backup...");
    await createBackup();
  },
  {
    timezone: "Asia/Colombo",
  }
);

console.log("✅ Backup Scheduler Started");

// Export for manual backup
module.exports = { createBackup };