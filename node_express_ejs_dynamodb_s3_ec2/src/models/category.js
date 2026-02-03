import crypto from "crypto";

export default class Category {
  constructor({ id, name, description, createdAt }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
  }

  /**
   * Tạo category từ form data
   */
  static fromForm({ name, description }) {
    return new Category({
      id: crypto.randomUUID(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo category từ DynamoDB item
   */
  static fromDynamo(item) {
    return new Category(item);
  }

  /**
   * Validate category data
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Tên danh mục không được để trống');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Tên danh mục không được vượt quá 100 ký tự');
    }

    return errors;
  }
}
