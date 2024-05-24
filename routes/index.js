var express = require('express');
var router = express.Router();

const { randomUUID } = require('crypto');
const { Ollama } = require('ollama');
const {modifyResponse} = require("../public/javascripts/responseModifier");

const conversations = {};

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  let sessionId = req.headers['session-id'];
  if (!sessionId) {
    sessionId = randomUUID();
    res.setHeader('session-id', sessionId);
  }

  const ollama = new Ollama();

  let conversationHistory = conversations[sessionId] || [];
  conversationHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await ollama.chat({
        model: 'gemma:2b',
        messages: conversationHistory,
    });

    console.log(response.message.content)
    const modifiedResponse = modifyResponse(response.message.content);

    conversationHistory.push({ role: 'assistant', content: response.message.content });
    conversations[sessionId] = conversationHistory;

    res.json({ response: modifiedResponse });

    console.log(sessionId);
    console.log(conversations[sessionId]);

  } catch (error) {
      console.error('Ollama error:', error);
      res.status(500).json({ error: 'Something went wrong' });
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: "world" });
});

module.exports = router;
