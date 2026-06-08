const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBackupEmail = async (filePath, fileName) => {
  try {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("BACKUP_RECEIVER:", process.env.BACKUP_RECEIVER);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.BACKUP_RECEIVER,
      subject: `Payroll Backup - ${new Date().toISOString().split("T")[0]}`,
      text: "Automatic database backup from payroll system.",
      attachments: [
        {
          filename: fileName,
          path: filePath,
        },
      ],
    });

    console.log("✅ Backup Email Sent");
    console.log("Message ID:", info.messageId);

  } catch (error) {
    console.error("❌ EMAIL ERROR:");
    console.error(error);
    throw error;
  }
};

module.exports = { sendBackupEmail };