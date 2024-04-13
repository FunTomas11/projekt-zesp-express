const db = require('../db');
const bcrypt = require('bcrypt');

async function createUser(username, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

async function login(username, password) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                reject(err); 
            } else if (!user) {
                reject(new Error('Invalid username or password'));
            } else {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    resolve(user);
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }
        });
    });
}

module.exports = { createUser, login };