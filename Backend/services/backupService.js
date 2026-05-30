const cron = require("node-cron");
const mysqldump = require("mysqldump");
const path = require("path");
const fs = require("fs");

const backupDir = path.join(__dirname, "../backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const createBackup = async () => {
  try {
    const date = new Date().toISOString().split("T")[0];

    const filePath = path.join(
      backupDir,
      `backup-${date}.sql`
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

    console.log(`✅ Backup Created: ${filePath}`);
  } catch (error) {
    console.error("❌ Backup Failed:", error);
  }
};

// Run every day at 12 AM
cron.schedule("0 0 * * *", () => {
  console.log("Running Daily Backup...");
  createBackup();
});

// Export for manual backup
module.exports = { createBackup };