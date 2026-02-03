import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * Routes cho categories
 * Tất cả routes đều yêu cầu đăng nhập
 * Chỉ admin mới được thêm/sửa/xóa
 */

// GET /categories - Danh sách categories (cả admin và staff đều xem được)
router.get("/", requireAuth, categoryController.listCategories);

// GET /categories/create - Form tạo category (chỉ admin)
router.get("/create", requireAdmin, categoryController.showCreateForm);

// POST /categories - Tạo category mới (chỉ admin)
router.post("/", requireAdmin, categoryController.createCategory);

// GET /categories/:id/edit - Form chỉnh sửa category (chỉ admin)
router.get("/:id/edit", requireAdmin, categoryController.showEditForm);

// POST /categories/:id - Cập nhật category (chỉ admin)
router.post("/:id", requireAdmin, categoryController.updateCategory);

// POST /categories/:id/delete - Xóa category (chỉ admin)
router.post("/:id/delete", requireAdmin, categoryController.deleteCategory);

// API: GET /categories/api/all - Lấy tất cả categories (cho dropdown)
router.get("/api/all", requireAuth, categoryController.getCategoriesAPI);

export default router;
