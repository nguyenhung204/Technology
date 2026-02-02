const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./app/routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DynamoDB CRUD API',
    endpoints: {
      'GET /api/products': 'Get all products',
      'GET /api/products/:id': 'Get product by ID',
      'POST /api/products': 'Create new product',
      'PUT /api/products/:id': 'Update product',
      'DELETE /api/products/:id': 'Delete product'
    }
  });
});

app.use('/api', productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`DynamoDB Endpoint: ${process.env.DYNAMODB_ENDPOINT}`);
});
