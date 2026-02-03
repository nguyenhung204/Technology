export default class Product {
  constructor({ id, name, price, quantity, categoryId, url_image, isDeleted, createdAt }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.categoryId = categoryId || null;
    this.url_image = url_image;
    this.isDeleted = isDeleted || false;
    this.createdAt = createdAt;
  }

  static fromForm(form, imageUrl) {
    return new Product({
      id: crypto.randomUUID(),
      name: form.name,
      price: Number(form.price),
      quantity: Number(form.quantity),
      categoryId: form.categoryId || null,
      url_image: imageUrl,
      isDeleted: false,
      createdAt: new Date().toISOString()
    });
  }

  static fromDynamo(item) {
    return new Product(item);
  }

  /**
   * Lấy trạng thái tồn kho
   */
  getStockStatus() {
    if (this.quantity <= 0) {
      return { status: 'out-of-stock', label: 'Hết hàng', class: 'danger' };
    } else if (this.quantity < 5) {
      return { status: 'low-stock', label: 'Sắp hết', class: 'warning' };
    } else {
      return { status: 'in-stock', label: 'Còn hàng', class: 'success' };
    }
  }

  /**
   * Kiểm tra có đủ hàng không
   */
  hasStock() {
    return this.quantity > 0;
  }

  /**
   * Validate product data
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tên sản phẩm không được để trống');
    }

    if (data.price === undefined || data.price === null || Number(data.price) < 0) {
      errors.push('Giá sản phẩm phải lớn hơn hoặc bằng 0');
    }

    if (data.quantity === undefined || data.quantity === null || Number(data.quantity) < 0) {
      errors.push('Số lượng phải lớn hơn hoặc bằng 0');
    }

    return errors;
  }
}
