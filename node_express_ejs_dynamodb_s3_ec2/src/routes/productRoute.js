import express from 'express';
import multer from 'multer';
import * as productController from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Danh sách sản phẩm
router.get('/', productController.listProducts);

// Form thêm sản phẩm
router.get('/create', productController.showCreateForm);

// Xử lý thêm sản phẩm
router.post('/create', upload.single('image'), productController.createProduct);

// Form chỉnh sửa sản phẩm
router.get('/edit/:id', productController.showEditForm);

// Xử lý cập nhật sản phẩm
router.post('/edit/:id', upload.single('image'), productController.updateProduct);

// Xóa sản phẩm
router.post('/delete/:id', productController.deleteProduct);

export default router;
