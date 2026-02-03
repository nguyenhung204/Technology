import bcrypt from "bcrypt";
import userRepository from "../repositories/userRepository.js";
import User from "../models/user.js";

const SALT_ROUNDS = 10;

/**
 * Service layer - Chứa business logic cho Users
 */

/**
 * Đăng nhập user
 */
export const login = async (username, password) => {
  // Tìm user theo username
  const userItem = await userRepository.findByUsername(username);
  
  if (!userItem) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }

  const user = User.fromDynamo(userItem);

  // So sánh password
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }

  // Trả về user (không bao gồm password)
  return user.toSafeObject();
};

/**
 * Tạo user mới (đăng ký)
 */
export const createUser = async (userData) => {
  const { username, password, role } = userData;

  // Validate
  if (!username || username.trim().length < 3) {
    throw new Error("Tên đăng nhập phải có ít nhất 3 ký tự");
  }

  if (!password || password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (role && !['admin', 'staff'].includes(role)) {
    throw new Error("Role phải là 'admin' hoặc 'staff'");
  }

  // Kiểm tra username đã tồn tại chưa
  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo user object
  const user = User.fromForm({ username, password: hashedPassword, role });

  // Lưu vào database
  await userRepository.create(user);

  return user.toSafeObject();
};

/**
 * Lấy user theo ID
 */
export const getUserById = async (id) => {
  const userItem = await userRepository.findById(id);
  
  if (!userItem) return null;
  
  const user = User.fromDynamo(userItem);
  return user.toSafeObject();
};

/**
 * Lấy tất cả users
 */
export const getAllUsers = async () => {
  const items = await userRepository.findAll();
  return items.map(item => {
    const user = User.fromDynamo(item);
    return user.toSafeObject();
  });
};

/**
 * Lấy users theo role
 */
export const getUsersByRole = async (role) => {
  const items = await userRepository.findByRole(role);
  return items.map(item => {
    const user = User.fromDynamo(item);
    return user.toSafeObject();
  });
};

/**
 * Thay đổi mật khẩu
 */
export const changePassword = async (id, oldPassword, newPassword) => {
  const userItem = await userRepository.findById(id);
  
  if (!userItem) {
    throw new Error("User không tồn tại");
  }

  const user = User.fromDynamo(userItem);

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Mật khẩu cũ không đúng");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password (implementation needed in repository)
  // await userRepository.updatePassword(id, hashedPassword);

  return true;
};
