import express from "express";
import multer from "multer";
import * as productController from "../controllers/productController_new.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Cấu hình multer cho upload ảnh
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Routes cho products
 * Staff có thể xem, chỉ admin mới được thêm/sửa/xóa
 */

// GET /products - Danh sách sản phẩm (có tìm kiếm & lọc)
router.get("/", requireAuth, productController.listProducts);

// GET /products/create - Form tạo sản phẩm (chỉ admin)
router.get("/create", requireAdmin, productController.showCreateForm);

// POST /products - Tạo sản phẩm mới (chỉ admin)
router.post("/", requireAdmin, upload.single("image"), productController.createProduct);

// GET /products/:id - Xem chi tiết sản phẩm
router.get("/:id", requireAuth, productController.showProduct);

// GET /products/:id/edit - Form chỉnh sửa sản phẩm (chỉ admin)
router.get("/:id/edit", requireAdmin, productController.showEditForm);

// POST /products/:id - Cập nhật sản phẩm (chỉ admin)
router.post("/:id", requireAdmin, upload.single("image"), productController.updateProduct);

// POST /products/:id/delete - Xóa sản phẩm (chỉ admin)
router.post("/:id/delete", requireAdmin, productController.deleteProduct);

// API: GET /products/api/inventory-stats - Thống kê tồn kho
router.get("/api/inventory-stats", requireAuth, productController.getInventoryStats);

export default router;
