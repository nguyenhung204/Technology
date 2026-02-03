import * as productService from "../services/productService_new.js";
import * as categoryService from "../services/categoryService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

/**
 * Controller layer - Xử lý request/response cho Products
 * Sử dụng service layer, không gọi repository trực tiếp
 */

/**
 * Hiển thị danh sách sản phẩm với tìm kiếm & lọc
 */
export const listProducts = asyncHandler(async (req, res) => {
  const { search, categoryId, minPrice, maxPrice, page = 1, pageSize = 10 } = req.query;

  // Nếu có filter/search, dùng searchAndFilterProducts
  if (search || categoryId || minPrice || maxPrice) {
    const result = await productService.searchAndFilterProducts({
      searchTerm: search,
      categoryId,
      minPrice,
      maxPrice,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    const categories = await categoryService.getAllCategories();

    return res.render("products/list_new", {
      products: result.products,
      categories,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      },
      filters: { search, categoryId, minPrice, maxPrice },
      currentUser: req.session.user
    });
  }

  // Không có filter, lấy tất cả
  const products = await productService.getAllProducts();
  const categories = await categoryService.getAllCategories();

  res.render("products/list_new", {
    products,
    categories,
    pagination: null,
    filters: {},
    currentUser: req.session.user
  });
});

/**
 * Hiển thị form thêm sản phẩm
 */
export const showCreateForm = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  
  res.render("products/create_new", {
    categories,
    error: null,
    formData: {},
    currentUser: req.session.user
  });
});

/**
 * Xử lý thêm sản phẩm mới
 */
export const createProduct = asyncHandler(async (req, res) => {
  try {
    await productService.createProduct(req.body, req.file);
    res.redirect("/products");
  } catch (error) {
    const categories = await categoryService.getAllCategories();
    res.render("products/create_new", {
      categories,
      error: error.message,
      formData: req.body,
      currentUser: req.session.user
    });
  }
});

/**
 * Hiển thị form chỉnh sửa sản phẩm
 */
export const showEditForm = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  
  if (!product) {
    return res.status(404).render('error', {
      message: 'Không tìm thấy sản phẩm',
      error: { status: 404 }
    });
  }

  const categories = await categoryService.getAllCategories();
  
  res.render("products/edit_new", {
    product,
    categories,
    error: null,
    currentUser: req.session.user
  });
});

/**
 * Xử lý cập nhật sản phẩm
 */
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    await productService.updateProduct(req.params.id, req.body, req.file);
    res.redirect("/products");
  } catch (error) {
    const product = await productService.getProductById(req.params.id);
    const categories = await categoryService.getAllCategories();
    
    res.render("products/edit_new", {
      product: { ...product, ...req.body },
      categories,
      error: error.message,
      currentUser: req.session.user
    });
  }
});

/**
 * Xử lý xóa sản phẩm (soft delete)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.redirect("/products");
});

/**
 * Hiển thị chi tiết sản phẩm
 */
export const showProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  
  if (!product) {
    return res.status(404).render('error', {
      message: 'Không tìm thấy sản phẩm',
      error: { status: 404 }
    });
  }

  const category = product.categoryId 
    ? await categoryService.getCategoryById(product.categoryId)
    : null;

  res.render("products/detail", {
    product,
    category,
    stockStatus: product.getStockStatus(),
    currentUser: req.session.user
  });
});

/**
 * API: Thống kê tồn kho
 */
export const getInventoryStats = asyncHandler(async (req, res) => {
  const stats = await productService.getInventoryStats();
  res.json({
    success: true,
    stats
  });
});
