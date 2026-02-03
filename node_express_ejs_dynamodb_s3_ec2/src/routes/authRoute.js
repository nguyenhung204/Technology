import express from "express";
import * as authController from "../controllers/authController.js";
import { redirectIfAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/**
 * Routes cho authentication
 */

// GET /auth/login - Hiển thị trang đăng nhập
router.get("/login", redirectIfAuthenticated, authController.showLoginPage);

// POST /auth/login - Xử lý đăng nhập
router.post("/login", authController.handleLogin);

// GET /auth/logout - Đăng xuất
router.get("/logout", authController.handleLogout);

// GET /auth/register - Hiển thị trang đăng ký (optional - để tạo user ban đầu)
router.get("/register", authController.showRegisterPage);

// POST /auth/register - Xử lý đăng ký
router.post("/register", authController.handleRegister);

// API: GET /auth/me - Lấy thông tin user hiện tại
router.get("/me", authController.getCurrentUser);

export default router;
