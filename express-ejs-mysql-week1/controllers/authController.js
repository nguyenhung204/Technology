const User = require('../models/User');

exports.loginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findByUsername(username);
    
    if (user && user.password === password) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/products');
    } else {
      res.render('login', { error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Có lỗi xảy ra' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
