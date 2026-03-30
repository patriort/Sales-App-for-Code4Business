const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseConnection {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '..', '..', 'data', 'sales.db');
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
  }

  init() {
    this.db.exec(`
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
  }

  getDb() {
    return this.db;
  }
}

module.exports = DatabaseConnection;
