const express = require("express");
const router = express.Router();
const { createBackup } = require("../services/backupService");
const path = require("path");
const fs = require("fs");

router.get("/create", async (req, res) => {
  try {
    await createBackup();

    res.json({
      success: true,
      message: "Backup created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/download/:file", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../backups",
    req.params.file
  );

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({
      message: "Backup not found",
    });
  }
});

router.get("/list", (req, res) => {
  const backupDir = path.join(__dirname, "../backups");

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(files);
  });
});

module.exports = router;