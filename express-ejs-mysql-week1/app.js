const express = require('express');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Routes
const authRoutes = require('./routes/auth.route.js');
const productRoutes = require('./routes/products.route.js');

app.use('/', authRoutes);
app.use('/products', productRoutes);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});