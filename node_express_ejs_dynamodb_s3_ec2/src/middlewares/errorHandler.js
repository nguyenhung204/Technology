/**
 * Middleware xử lý lỗi global
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Đã xảy ra lỗi';

  // Nếu là AJAX request, trả về JSON
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Nếu là request thông thường, render trang error
  res.status(status).render('error', {
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

/**
 * Middleware xử lý 404
 */
export const notFound = (req, res) => {
  res.status(404).render('error', {
    message: 'Trang không tồn tại',
    error: { status: 404 }
  });
};

/**
 * Async handler wrapper - tự động catch error trong async functions
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
