const Product = require('../models/Product');

exports.index = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render('products', { 
      products,
      username: req.session.username 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi server');
  }
};

exports.addProduct = async (req, res) => {
  const { name, price, quantity } = req.body;
  try {
    await Product.create(name, price, quantity);
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi thêm sản phẩm');
  }
};

exports.editPage = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    res.render('edit-product', { 
      product,
      username: req.session.username 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi server');
  }
};

exports.updateProduct = async (req, res) => {
  const { name, price, quantity } = req.body;
  try {
    await Product.update(req.params.id, name, price, quantity);
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi cập nhật sản phẩm');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi xóa sản phẩm');
  }
};
