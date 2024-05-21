const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('.bar_assistant.db');
const drinks = require('./data/drinks.json');
const images = require('./data/images.json')
const ingredients = require('./data/ingredients.json')
const drinkIngredients = require('./data/drink_ingredients.json')

db.run(`
    CREATE TABLE IF NOT EXISTS users
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT        NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS drinks
    (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        name   TEXT NOT NULL,
        recipe TEXT NOT NULL
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS ingredients
    (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS drink_ingredients
    (
        drinkId      INTEGER,
        ingredientId INTEGER,
        quantity     TEXT,
        FOREIGN KEY (drinkId) REFERENCES drinks (id),
        FOREIGN KEY (ingredientId) REFERENCES ingredients (id),
        PRIMARY KEY (drinkId, ingredientId)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS images
    (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        drinkId INTEGER,
        path    TEXT NOT NULL,
        FOREIGN KEY (drinkId) REFERENCES drinks (id)
    )
`)

// DRINKS INSERT
const sql = 'INSERT INTO drinks (id, name, recipe) VALUES ' +
    drinks.map(() => '(?, ?, ?)').join(', ');

const values = drinks.reduce((acc, drink) => {
    acc.push(drink.id, drink.name, drink.recipe);
    return acc;
}, []);

db.run(sql, values, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Rows inserted: ${this.changes}`);
});

// IMAGES INSERT
const imagesSql = 'INSERT INTO images (id, drinkId, path) VALUES ' +
    images.map(() => '(?, ?, ?)').join(', ');

const imagesValues = images.reduce((acc, image) => {
    acc.push(image.id, image.drinkId, image.path);
    return acc;
}, []);

db.run(imagesSql, imagesValues, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Rows inserted: ${this.changes}`);
})

// INGREDIENTS INSERT
const ingredientsSql = 'INSERT INTO ingredients (id, name) VALUES ' +
    ingredients.map(() => '(?, ?)').join(', ');

const ingredientsValues = ingredients.reduce((acc, ingredient) => {
    acc.push(ingredient.id, ingredient.name);
    return acc;
}, []);
console.log('DRINK ingredients', ingredientsValues)

db.run(ingredientsSql, ingredientsValues, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Rows inserted: ${this.changes}`);
});

// DRINK INGREDIENTS INSERT
const drinkIngredientsSql = 'INSERT INTO drink_ingredients (drinkId, ingredientId, quantity) VALUES ' +
    drinkIngredients.map(() => '(?, ?, ?)').join(', ');

const drinkIngredientsValues = drinkIngredients.reduce((acc, drinkIngredient) => {
    acc.push(drinkIngredient.drinkId, drinkIngredient.ingredientId, drinkIngredient.quantity);
    return acc;
}, []);
db.run(drinkIngredientsSql, drinkIngredientsValues, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Rows inserted: ${this.changes}`);
});


module.exports = db;