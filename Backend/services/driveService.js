

const { google } = require("googleapis");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

const uploadFile = async (filePath, fileName) => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "application/sql",
      body: fs.createReadStream(filePath),
    },
  });

  return response.data.id;
};

module.exports = { uploadFile };