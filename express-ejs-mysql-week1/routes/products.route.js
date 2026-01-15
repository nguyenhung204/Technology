const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, productController.index);
router.post('/add', requireAuth, productController.addProduct);
router.get('/edit/:id', requireAuth, productController.editPage);
router.post('/edit/:id', requireAuth, productController.updateProduct);
router.post('/delete/:id', requireAuth, productController.deleteProduct);

module.exports = router;