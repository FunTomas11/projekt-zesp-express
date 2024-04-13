var express = require('express');
var router = express.Router();

const session = require('express-session');
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

  try {
      const user = await login(username, password);
      req.session.userId = user.id;
      res.json({ message: 'Login successful', user });
  } catch (err) {
      console.error(err);
      res.status(401).json({ error: err.message });
  }
});

module.exports = router;
