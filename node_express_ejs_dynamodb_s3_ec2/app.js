import dotenv from "dotenv";
// Load .env TRƯỚC KHI import các modules khác
dotenv.config();

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { addUserToLocals } from "./src/middlewares/auth.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.js";
import { requestLogger } from "./src/middlewares/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log("=== AWS Configuration ===");
console.log("Access Key:", process.env.AWS_ACCESS_KEY_ID ? "✓ Loaded" : "✗ Missing");
console.log("Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Loaded" : "✗ Missing");
console.log("Region:", process.env.AWS_REGION);
console.log("S3 Bucket:", process.env.S3_BUCKET);
console.log("=========================\n");

// ==================== MIDDLEWARE ====================

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "src/public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true nếu dùng HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Request logging
app.use(requestLogger);

app.use(addUserToLocals);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));


// Root route
app.get("/", (req, res) => {
  if (req.session && req.session.user) {
    res.redirect("/products");
  } else {
    res.redirect("/auth/login");
  }
});


const authRoutes = (await import("./src/routes/authRoute.js")).default;
const productRoutes = (await import("./src/routes/productRoute_new.js")).default;
const categoryRoutes = (await import("./src/routes/categoryRoute.js")).default;


app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});


// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
