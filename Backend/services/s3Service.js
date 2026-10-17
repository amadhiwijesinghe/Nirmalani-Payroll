
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const fs = require("fs");
const path = require("path");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getBucketName = () => {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME is not configured");
  }

  return bucket;
};

// Upload a backup to S3
const uploadBackup = async (filePath, fileName) => {
  const fileContent = fs.createReadStream(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: fileName,
      Body: fileContent,
      ContentType: "application/sql",
    })
  );

  console.log("Uploaded backup to S3:", fileName);
};

// List backup files stored in S3
const listBackups = async () => {
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: getBucketName(),
    })
  );

  return (response.Contents || [])
    .filter(
      (item) =>
        item.Key &&
        /^backup-[\d_-]+\.sql$/.test(item.Key)
    )
    .map((item) => item.Key)
    .sort()
    .reverse();
};

// Download a backup file from S3
const downloadBackup = async (fileName) => {
  if (
    typeof fileName !== "string" ||
    !/^backup-[\d_-]+\.sql$/.test(fileName)
  ) {
    throw new Error("Invalid backup filename");
  }

  return s3.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: fileName,
    })
  );
};

module.exports = {
  uploadBackup,
  listBackups,
  downloadBackup,
};
