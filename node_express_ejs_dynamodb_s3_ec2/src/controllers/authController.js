import * as userService from "../services/userService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

/**
 * Controller layer - Xử lý request/response cho Authentication
 * Không chứa business logic, chỉ validate input và gọi service
 */

/**
 * Hiển thị trang đăng nhập
 */
export const showLoginPage = (req, res) => {
  res.render('auth/login', { 
    error: null,
    username: ''
  });
};

/**
 * Xử lý đăng nhập
 */
export const handleLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.render('auth/login', {
      error: 'Vui lòng nhập đầy đủ thông tin',
      username: username || ''
    });
  }

  try {
    // Gọi service để xử lý business logic
    const user = await userService.login(username, password);

    // Lưu user vào session
    req.session.user = user;

    // Redirect về trang chủ
    res.redirect('/products');
  } catch (error) {
    res.render('auth/login', {
      error: error.message,
      username
    });
  }
});

/**
 * Xử lý đăng xuất
 */
export const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/auth/login');
  });
};

/**
 * Hiển thị trang đăng ký (chỉ dùng để tạo account ban đầu)
 */
export const showRegisterPage = (req, res) => {
  res.render('auth/register', {
    error: null,
    formData: {}
  });
};

/**
 * Xử lý đăng ký
 */
export const handleRegister = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;

  // Validate input
  if (!username || !password || !confirmPassword) {
    return res.render('auth/register', {
      error: 'Vui lòng nhập đầy đủ thông tin',
      formData: { username, role }
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/register', {
      error: 'Mật khẩu xác nhận không khớp',
      formData: { username, role }
    });
  }

  try {
    // Gọi service
    await userService.createUser({ username, password, role: role || 'staff' });

    // Redirect về trang login
    res.redirect('/auth/login?registered=true');
  } catch (error) {
    res.render('auth/register', {
      error: error.message,
      formData: { username, role }
    });
  }
});

/**
 * API: Get current user info
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
});
