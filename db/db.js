const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('.bar_assistant.db');

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

module.exports = db;