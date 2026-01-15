const db = require('../config/db/db');

class Product {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(name, price, quantity) {
    const [result] = await db.query(
      'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
      [name, price, quantity]
    );
    return result;
  }

  static async update(id, name, price, quantity) {
    const [result] = await db.query(
      'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
      [name, price, quantity, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Product;
