import * as productService from "../services/productService.js";

// Hiển thị danh sách sản phẩm
export const listProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.render("products/list", { products });
  } catch (error) {
    console.error("Error in listProducts:", error);
    res.status(500).send("Lỗi khi tải danh sách sản phẩm");
  }
};

// Hiển thị form thêm sản phẩm
export const showCreateForm = (req, res) => {
  res.render("products/create");
};

// Xử lý thêm sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    await productService.createProduct(req.body, req.file);
    res.redirect("/products");
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).send("Lỗi khi tạo sản phẩm");
  }
};

// Hiển thị form chỉnh sửa sản phẩm
export const showEditForm = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send("Không tìm thấy sản phẩm");
    }
    res.render("products/edit", { product });
  } catch (error) {
    console.error("Error in showEditForm:", error);
    res.status(500).send("Lỗi khi tải form chỉnh sửa");
  }
};

// Xử lý cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    await productService.updateProduct(req.params.id, req.body, req.file);
    res.redirect("/products");
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).send("Lỗi khi cập nhật sản phẩm");
  }
};

// Xử lý xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.redirect("/products");
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).send("Lỗi khi xóa sản phẩm");
  }
};
