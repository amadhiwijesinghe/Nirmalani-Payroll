const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadBackup = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
    })
  );

  console.log("✅ Uploaded to S3:", fileName);
};

module.exports = { uploadBackup };