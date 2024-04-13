var express = require('express');
var router = express.Router();
const { randomUUID } = require('crypto');

const { createUser, login } = require('../db/models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
      const userId = await createUser(username, password);
      res.json({ message: 'Registration successful', userId });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
  }
});

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
