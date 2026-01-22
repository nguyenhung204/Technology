import { PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

const s3 = new S3Client({
    region: process.env.AWS_REGION?.trim() || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || ""
    }
});

const BUCKET_NAME = process.env.S3_BUCKET;

// Upload ảnh lên S3
export const uploadImage = async (file, key) => {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));
        console.log(`Image uploaded successfully: ${key}`);
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// Xóa ảnh khỏi S3
export const deleteImage = async (key) => {
    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        }));
        console.log(`Image deleted successfully: ${key}`);
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};

// Lấy URL công khai của ảnh
export const getImageUrl = (key) => {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}; 

const whoAmI = async () => {
  const sts = new STSClient({ region: process.env.AWS_REGION || "us-east-1" });
  const res = await sts.send(new GetCallerIdentityCommand({}));
  console.log("AWS IDENTITY:", res);
};

whoAmI();




