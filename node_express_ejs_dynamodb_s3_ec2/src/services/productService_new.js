import productRepository from "../repositories/productRepository.js";
import { uploadImage, deleteImage, getImageUrl } from "./s3Service.js";
import Product from "../models/product.js";

/**
 * Service layer - Chứa business logic cho Products
 * Sử dụng repository để thao tác database
 */

/**
 * Lấy tất cả sản phẩm (không bị xóa)
 */
export const getAllProducts = async () => {
  const items = await productRepository.findAll();
  return items.map(item => Product.fromDynamo(item));
};

/**
 * Lấy sản phẩm theo ID
 */
export const getProductById = async (id) => {
  const item = await productRepository.findById(id);
  if (!item) return null;
  
  const product = Product.fromDynamo(item);
  // Không trả về sản phẩm đã bị xóa
  if (product.isDeleted) return null;
  
  return product;
};

/**
 * Lấy sản phẩm theo category
 */
export const getProductsByCategory = async (categoryId) => {
  const items = await productRepository.findByCategory(categoryId);
  return items.map(item => Product.fromDynamo(item));
};

/**
 * Tìm kiếm và lọc sản phẩm với phân trang
 */
export const searchAndFilterProducts = async (filters) => {
  const { categoryId, minPrice, maxPrice, searchTerm, page = 1, pageSize = 10 } = filters;
  
  // DynamoDB không hỗ trợ offset pagination, chỉ hỗ trợ cursor-based pagination
  // Để đơn giản, ta sẽ lấy tất cả và filter ở application layer
  const result = await productRepository.filter({
    categoryId,
    minPrice,
    maxPrice,
    searchTerm
  });

  const products = result.items.map(item => Product.fromDynamo(item));
  
  // Sort và phân trang ở application layer
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    total: products.length,
    page,
    pageSize,
    totalPages: Math.ceil(products.length / pageSize)
  };
};

/**
 * Tạo sản phẩm mới
 */
export const createProduct = async (formData, imageFile) => {
  // Validate
  const errors = Product.validate(formData);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  let imageUrl = null;

  // Upload ảnh lên S3 nếu có
  if (imageFile) {
    const productId = crypto.randomUUID();
    const imageKey = `products/${productId}/${imageFile.originalname}`;
    await uploadImage(imageFile, imageKey);
    imageUrl = getImageUrl(imageKey);
  }

  // Tạo product object
  const product = Product.fromForm(formData, imageUrl);

  // Lưu vào database thông qua repository
  await productRepository.create(product);

  return product;
};

/**
 * Cập nhật sản phẩm
 */
export const updateProduct = async (id, formData, imageFile) => {
  // Validate
  const errors = Product.validate(formData);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error("Sản phẩm không tồn tại");
  }

  let imageUrl = existingProduct.url_image;

  // Upload ảnh mới nếu có
  if (imageFile) {
    const imageKey = `products/${id}/${imageFile.originalname}`;
    await uploadImage(imageFile, imageKey);
    imageUrl = getImageUrl(imageKey);

    // Xóa ảnh cũ nếu có
    if (existingProduct.url_image) {
      const oldKey = extractKeyFromUrl(existingProduct.url_image);
      if (oldKey) {
        try {
          await deleteImage(oldKey);
        } catch (err) {
          console.log("Không thể xóa ảnh cũ:", err.message);
        }
      }
    }
  }

  // Cập nhật thông qua repository
  const updateData = {
    name: formData.name,
    price: Number(formData.price),
    quantity: Number(formData.quantity),
    categoryId: formData.categoryId || null,
    url_image: imageUrl
  };

  const updated = await productRepository.update(id, updateData);
  return Product.fromDynamo(updated);
};

/**
 * Soft delete sản phẩm
 */
export const deleteProduct = async (id) => {
  const product = await getProductById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  // Soft delete
  await productRepository.softDelete(id);
  
  return true;
};

/**
 * Hard delete sản phẩm (dùng khi cần xóa vĩnh viễn)
 */
export const permanentlyDeleteProduct = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  // Xóa ảnh trên S3 nếu có
  if (product.url_image) {
    const imageKey = extractKeyFromUrl(product.url_image);
    if (imageKey) {
      try {
        await deleteImage(imageKey);
      } catch (err) {
        console.log("Không thể xóa ảnh:", err.message);
      }
    }
  }

  // Hard delete
  await productRepository.hardDelete(id);
  
  return true;
};

/**
 * Lấy thống kê tồn kho
 */
export const getInventoryStats = async () => {
  const products = await getAllProducts();
  
  const stats = {
    total: products.length,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  };

  products.forEach(product => {
    const status = product.getStockStatus();
    if (status.status === 'in-stock') stats.inStock++;
    else if (status.status === 'low-stock') stats.lowStock++;
    else if (status.status === 'out-of-stock') stats.outOfStock++;
  });

  return stats;
};

/**
 * Đếm số sản phẩm theo category
 */
export const countProductsByCategory = async (categoryId) => {
  return await productRepository.countByCategory(categoryId);
};

/**
 * Helper: Extract S3 key from URL
 */
function extractKeyFromUrl(url) {
  if (!url) return null;
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}
