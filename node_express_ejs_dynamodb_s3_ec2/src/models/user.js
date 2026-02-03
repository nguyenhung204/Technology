import crypto from "crypto";

export default class User {
  constructor({ id, username, password, role, createdAt }) {
    this.id = id;
    this.username = username;
    this.password = password; // Hashed password
    this.role = role; // 'admin' or 'staff'
    this.createdAt = createdAt;
  }

  /**
   * Tạo user từ form data (chưa hash password)
   */
  static fromForm({ username, password, role }) {
    return new User({
      id: crypto.randomUUID(),
      username,
      password, // Will be hashed in service layer
      role: role || 'staff',
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Tạo user từ DynamoDB item
   */
  static fromDynamo(item) {
    return new User(item);
  }

  /**
   * Chuyển sang plain object (không bao gồm password khi trả về client)
   */
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      createdAt: this.createdAt
    };
  }

  /**
   * Kiểm tra user có phải admin không
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Kiểm tra user có phải staff không
   */
  isStaff() {
    return this.role === 'staff';
  }
}
