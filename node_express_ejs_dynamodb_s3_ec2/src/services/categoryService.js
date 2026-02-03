import categoryRepository from "../repositories/categoryRepository.js";
import productRepository from "../repositories/productRepository.js";
import Category from "../models/category.js";

/**
 * Service layer - Chứa business logic cho Categories
 */

/**
 * Lấy tất cả categories
 */
export const getAllCategories = async () => {
  const items = await categoryRepository.findAll();
  return items.map(item => Category.fromDynamo(item));
};

/**
 * Lấy category theo ID
 */
export const getCategoryById = async (id) => {
  const item = await categoryRepository.findById(id);
  if (!item) return null;
  return Category.fromDynamo(item);
};

/**
 * Tạo category mới
 */
export const createCategory = async (formData) => {
  // Validate
  const errors = Category.validate(formData);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  // Kiểm tra tên đã tồn tại chưa
  const existing = await categoryRepository.findByName(formData.name);
  if (existing) {
    throw new Error("Tên danh mục đã tồn tại");
  }

  // Tạo category object
  const category = Category.fromForm(formData);

  // Lưu vào database
  await categoryRepository.create(category);

  return category;
};

/**
 * Cập nhật category
 */
export const updateCategory = async (id, formData) => {
  // Validate
  const errors = Category.validate(formData);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  const existingCategory = await getCategoryById(id);
  if (!existingCategory) {
    throw new Error("Danh mục không tồn tại");
  }

  // Kiểm tra tên trùng (ngoại trừ chính nó)
  const duplicateCategory = await categoryRepository.findByName(formData.name);
  if (duplicateCategory && duplicateCategory.id !== id) {
    throw new Error("Tên danh mục đã tồn tại");
  }

  // Cập nhật
  const updateData = {
    name: formData.name,
    description: formData.description || ''
  };

  const updated = await categoryRepository.update(id, updateData);
  return Category.fromDynamo(updated);
};

/**
 * Xóa category
 * Business rule: Không xóa sản phẩm khi xóa category
 */
export const deleteCategory = async (id) => {
  const category = await getCategoryById(id);
  if (!category) {
    throw new Error("Danh mục không tồn tại");
  }

  // Kiểm tra có sản phẩm nào thuộc category này không
  const productCount = await productRepository.countByCategory(id);
  
  if (productCount > 0) {
    // Option 1: Không cho phép xóa nếu có sản phẩm
    // throw new Error(`Không thể xóa danh mục vì còn ${productCount} sản phẩm thuộc danh mục này`);
    
    // Option 2: Cảnh báo nhưng vẫn cho xóa (sản phẩm sẽ không bị xóa, chỉ mất categoryId)
    console.log(`Cảnh báo: Có ${productCount} sản phẩm thuộc danh mục này`);
  }

  // Xóa category (sản phẩm vẫn tồn tại nhưng categoryId sẽ trỏ đến category không còn tồn tại)
  await categoryRepository.delete(id);

  return {
    success: true,
    affectedProducts: productCount
  };
};

/**
 * Lấy thống kê category
 */
export const getCategoryStats = async () => {
  const categories = await getAllCategories();
  
  const stats = await Promise.all(
    categories.map(async (category) => {
      const productCount = await productRepository.countByCategory(category.id);
      return {
        ...category,
        productCount
      };
    })
  );

  return stats;
};
