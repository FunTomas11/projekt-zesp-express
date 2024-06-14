var express = require('express');
var router = express.Router();
const { randomUUID } = require('crypto');

const { createUser, login } = require('../db/models/user');

/**
 * Endpoint GET /users - Zwraca odpowiedź z zasobem użytkowników.
 */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/**
 * Endpoint POST /register - Rejestruje nowego użytkownika.
 *
 *
 * @param {Object} req - Obiekt żądania HTTP.
 * @param {Object} res - Obiekt odpowiedzi HTTP.
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const sessionId = req.body.sessionId || randomUUID();

    try {
        const userId = await createUser(username, password);
        res.json({ message: 'Registration successful', userId, sessionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * Endpoint POST /login - Loguje użytkownika.
 *
 *
 * @param {Object} req - Obiekt żądania HTTP.
 * @param {Object} res - Obiekt odpowiedzi HTTP.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sessionId = req.body.sessionId || randomUUID();

    try {
        const user = await login(username, password);
        res.json({ message: 'Login successful', user, sessionId });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: err.message });
    }
});

module.exports = router;
