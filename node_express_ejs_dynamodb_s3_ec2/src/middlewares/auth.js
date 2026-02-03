/**
 * Middleware kiểm tra user đã đăng nhập chưa
 */
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * Middleware kiểm tra user đã đăng nhập (dùng cho API)
 */
export const requireAuthAPI = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Vui lòng đăng nhập' 
    });
  }
  next();
};

/**
 * Middleware kiểm tra user có phải admin không
 */
export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Bạn không có quyền truy cập trang này',
      error: { status: 403 }
    });
  }

  next();
};

/**
 * Middleware kiểm tra role (admin hoặc staff)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('error', {
        message: 'Bạn không có quyền truy cập trang này',
        error: { status: 403 }
      });
    }

    next();
  };
};

/**
 * Middleware thêm user info vào locals (để dùng trong views)
 */
export const addUserToLocals = (req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
};

/**
 * Middleware kiểm tra user đã đăng nhập thì không cho vào trang login
 */
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/products');
  }
  next();
};
