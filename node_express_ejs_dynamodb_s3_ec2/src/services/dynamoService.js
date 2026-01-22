import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

console.log("DynamoDB Client Credentials:", {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "MISSING",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? "***" + process.env.AWS_SECRET_ACCESS_KEY.slice(-4) : "MISSING",
    region: process.env.AWS_REGION?.trim() || "us-east-1"
});

const client = new DynamoDBClient({
    region: process.env.AWS_REGION?.trim() || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || ""
    }
})
export const db = DynamoDBDocumentClient.from(client);