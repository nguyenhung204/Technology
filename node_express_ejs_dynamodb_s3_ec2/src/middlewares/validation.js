/**
 * Middleware logging requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.session?.user?.username || 'guest';
    
    console.log(`[${new Date().toISOString()}] ${user} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

/**
 * Middleware validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  // Validate
  if (page < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Page phải lớn hơn 0' 
    });
  }

  if (pageSize < 1 || pageSize > 100) {
    return res.status(400).json({ 
      success: false, 
      message: 'PageSize phải từ 1 đến 100' 
    });
  }

  req.pagination = { page, pageSize };
  next();
};
