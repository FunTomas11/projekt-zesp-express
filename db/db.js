const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('.bar_assistant.db');

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS drinks ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        recipe TEXT NOT NULL
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS ingredients ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS drink_ingredients ( 
        drinkId INTEGER,
        ingredientId INTEGER,
        quantity TEXT,
        FOREIGN KEY (drinkId) REFERENCES drinks(id),
        FOREIGN KEY (ingredientId) REFERENCES ingredients(id),
        PRIMARY KEY (drinkId, ingredientId)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS images ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drinkId INTEGER,
        path TEXT NOT NULL,
        FOREIGN KEY (drinkId) REFERENCES drinks(id)
    )
`)

module.exports = db;