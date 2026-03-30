const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'sales.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    amount REAL NOT NULL,
    score INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/sales', (_req, res) => {
  const stmt = db.prepare(`
    SELECT id, customer, product, amount, score, created_at AS createdAt, updated_at AS updatedAt
    FROM sales
    ORDER BY id DESC
  `);
  const sales = stmt.all();
  res.json(sales);
});

app.post('/sales', (req, res) => {
  const { customer, product, amount } = req.body;

  if (!customer || !product || amount === undefined) {
    return res.status(400).json({ error: 'customer, product y amount son obligatorios' });
  }

  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount debe ser un numero mayor a 0' });
  }

  const insert = db.prepare(`
    INSERT INTO sales (customer, product, amount)
    VALUES (?, ?, ?)
  `);

  const result = insert.run(customer.trim(), product.trim(), parsedAmount);

  const row = db.prepare(`
    SELECT id, customer, product, amount, score, created_at AS createdAt, updated_at AS updatedAt
    FROM sales
    WHERE id = ?
  `).get(result.lastInsertRowid);

  return res.status(201).json(row);
});

app.patch('/sales/:id/score', (req, res) => {
  const id = Number(req.params.id);
  const score = Number(req.body.score);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'id invalido' });
  }

  if (Number.isNaN(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: 'score debe estar entre 1 y 5' });
  }

  const update = db.prepare(`
    UPDATE sales
    SET score = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  const result = update.run(score, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'venta no encontrada' });
  }

  const row = db.prepare(`
    SELECT id, customer, product, amount, score, created_at AS createdAt, updated_at AS updatedAt
    FROM sales
    WHERE id = ?
  `).get(id);

  return res.json(row);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
