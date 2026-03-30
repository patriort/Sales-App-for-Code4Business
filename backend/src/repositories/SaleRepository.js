const Sale = require('../models/Sale');

class SaleRepository {
  constructor(db) {
    this.db = db;
  }

  list() {
    const stmt = this.db.prepare(`
      SELECT id, customer, product, amount, score, created_at AS createdAt, updated_at AS updatedAt
      FROM sales
      ORDER BY id DESC
    `);
    return stmt.all().map((row) => Sale.fromRow(row));
  }

  findById(id) {
    const stmt = this.db.prepare(`
      SELECT id, customer, product, amount, score, created_at AS createdAt, updated_at AS updatedAt
      FROM sales
      WHERE id = ?
    `);
    return Sale.fromRow(stmt.get(id));
  }

  create({ customer, product, amount }) {
    const insert = this.db.prepare(`
      INSERT INTO sales (customer, product, amount)
      VALUES (?, ?, ?)
    `);
    const result = insert.run(customer, product, amount);
    return this.findById(result.lastInsertRowid);
  }

  updateScore(id, score) {
    const update = this.db.prepare(`
      UPDATE sales
      SET score = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    const result = update.run(score, id);
    if (result.changes === 0) {
      return null;
    }
    return this.findById(id);
  }
}

module.exports = SaleRepository;
