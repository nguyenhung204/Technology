import * as categoryService from "../services/categoryService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

/**
 * Controller layer - Xử lý request/response cho Categories
 */

/**
 * Hiển thị danh sách categories
 */
export const listCategories = asyncHandler(async (req, res) => {
  const stats = await categoryService.getCategoryStats();
  res.render("categories/list", { 
    categories: stats,
    currentUser: req.session.user
  });
});

/**
 * Hiển thị form tạo category
 */
export const showCreateForm = (req, res) => {
  res.render("categories/create", { 
    error: null,
    formData: {},
    currentUser: req.session.user
  });
};

/**
 * Xử lý tạo category
 */
export const createCategory = asyncHandler(async (req, res) => {
  try {
    await categoryService.createCategory(req.body);
    res.redirect("/categories");
  } catch (error) {
    res.render("categories/create", {
      error: error.message,
      formData: req.body,
      currentUser: req.session.user
    });
  }
});

/**
 * Hiển thị form chỉnh sửa category
 */
export const showEditForm = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  
  if (!category) {
    return res.status(404).render('error', {
      message: 'Không tìm thấy danh mục',
      error: { status: 404 }
    });
  }

  res.render("categories/edit", { 
    category,
    error: null,
    currentUser: req.session.user
  });
});

/**
 * Xử lý cập nhật category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    await categoryService.updateCategory(req.params.id, req.body);
    res.redirect("/categories");
  } catch (error) {
    const category = await categoryService.getCategoryById(req.params.id);
    res.render("categories/edit", {
      category: { ...category, ...req.body },
      error: error.message,
      currentUser: req.session.user
    });
  }
});

/**
 * Xử lý xóa category
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  
  if (result.affectedProducts > 0) {
    // Có thể hiển thị thông báo về số sản phẩm bị ảnh hưởng
    req.session.message = `Đã xóa danh mục. ${result.affectedProducts} sản phẩm không còn thuộc danh mục nào.`;
  }
  
  res.redirect("/categories");
});

/**
 * API: Get all categories (cho dropdown)
 */
export const getCategoriesAPI = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json({
    success: true,
    categories
  });
});
