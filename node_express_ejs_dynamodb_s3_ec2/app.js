import dotenv from "dotenv";
// Load .env TRƯỚC KHI import các modules khác
dotenv.config();

import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log("AWS Credentials loaded:");
console.log("  Access Key:", process.env.AWS_ACCESS_KEY_ID ? "✓ Loaded" : "✗ Missing");
console.log("  Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Loaded" : "✗ Missing");
console.log("  Region:", process.env.AWS_REGION);
console.log("  Access Key value:", JSON.stringify(process.env.AWS_ACCESS_KEY_ID));
console.log("  Secret Key value:", JSON.stringify(process.env.AWS_SECRET_ACCESS_KEY));
console.log("  Region value:", JSON.stringify(process.env.AWS_REGION));
console.log("S3 Bucket:", process.env.S3_BUCKET);


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "src/public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Routes
app.get("/", (req, res) => {
  res.redirect("/products");
});

// Import routes SAU KHI dotenv đã load
const productRoutes = (await import("./src/routes/productRoute.js")).default;
app.use("/products", productRoutes);


const sts = new STSClient({ region: "us-east-1" });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});



