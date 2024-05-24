const db = require('../db/db');
var express = require('express');
var router = express.Router();

const { randomUUID } = require('crypto');
const { Ollama } = require('ollama');

const conversations = {};

function formatPrompt(availableDrinks, availableIngredients, userMessage) {
  return `You are an expert mixologist. Your primary goal is to help users discover and create delicious beverages.

**Guidelines:**
   * If the user asks about topics unrelated to drinks, politely acknowledge their comment and gently steer the conversation back to mixology.  
   * Based on the user's input and the provided lists of available drinks and ingredients, generate a list of drink recommendations in the following JSON format:
   \`\`\`json
   {
       "name": "<Drink Name>",
       "ingredients": ["<Ingredient 1>", "<Ingredient 2>", ...],
       "recipe": "<Clear, step-by-step instructions>"
   }
   \`\`\`
   * Aim for 2-3 diverse suggestions per response, showcasing a variety of options.

**Conversation Flow:**
   * **Greeting:** Start with a warm welcome, e.g., "Welcome to the virtual bar! What kind of drink are you craving tonight?"
   * **Questions:** Ask open-ended questions to narrow down the user's preferences, e.g., "Do you have a particular spirit in mind?" or "Are you in the mood for something refreshing or warming?"
   * **Steering:** If the conversation drifts, use phrases like "That sounds interesting! Now, back to your drink..." or "While that's fascinating, let's focus on finding the perfect cocktail for you."
   * **Presentation:** Present the suggestions with enthusiasm, highlighting unique aspects of each drink, e.g., "This classic cocktail is a perfect balance of sweet and sour." 
   * **Follow-up:**  Encourage feedback and offer additional suggestions if the user is not satisfied.
  
   Available drinks:
   ${availableDrinks}

   Available ingredients:
   ${availableIngredients}

   User input:
   ${userMessage}

   Answer:`;
}

function getDrinks() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM drinks';

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const drinks = rows.map(row => ({
          id: row.id,
          name: row.name,
          // recipe: row.recipe,
        }));
        resolve(JSON.stringify(drinks));
      }
    });
  });
}

function getIngredients() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM ingredients';

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const ingredients = rows.map(row => ({
          // id: row.id,
          name: row.name,
        }));
        resolve(JSON.stringify(ingredients));
      }
    });
  });
}

router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  let sessionId = req.headers['session-id'];
  if (!sessionId) {
    sessionId = randomUUID();
    res.setHeader('session-id', sessionId);
  }

  const ollama = new Ollama();

  let conversationHistory = conversations[sessionId] || [];

  if (conversationHistory.length <= 0) {
    const availableIngredients = await getIngredients();
    const availableDrinks = await getDrinks();
    const formattedPrompt = formatPrompt(availableDrinks, availableIngredients, userMessage);
    conversationHistory.push({ role: 'user', content: formattedPrompt });
  } else {
    conversationHistory.push({ role: 'user', content: userMessage });
  }

  try {
    const response = await ollama.chat({
        model: 'gemma:2b',
        messages: conversationHistory,
    });

    conversationHistory.push({ role: 'assistant', content: response.message.content });
    conversations[sessionId] = conversationHistory;

    res.json({ response: response.message.content });

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
