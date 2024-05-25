const db = require('../db/db');
var express = require('express');
var router = express.Router();

const { randomUUID } = require('crypto');
const { Ollama } = require('ollama');
const {modifyResponse} = require("../public/javascripts/responseModifier");

const conversations = {};

function formatPrompt(availableDrinks, availableIngredients, userMessage) {
  return `You are an expert mixologist. Your primary goal is to help users discover and create delicious beverages.
Guidelines:
If the user asks about topics unrelated to drinks, politely acknowledge their comment and gently steer the conversation back to mixology.  
Based on the user's input and the provided lists of available drinks and ingredients try to provide helpful suggestions.
At the end generate a drink recommendation in the following JSON format:
\`\`\`json
{"id":"drinkId","name":"drinkName","ingredients": ["ingredient1", "ingredient2" ... all ingredients for given drink]}
\`\`\`

Available drinks:
${availableDrinks}

Available ingredients:
${availableIngredients}

User input:
${userMessage}

Answer:`;
}

function formatSubPrompt(userMessage) {
  return `User input:
${userMessage}

Generate a single drink recommendation. Always format the recommendation as JSON in the following format:
\`\`\`json
{"id":"drinkId","name":"drinkName","ingredients": ["ingredient1", "ingredient2" ... all ingredients for given drink]}
\`\`\`

Answer:\`\`\`json`;
}

function getDrinksImg(drinkId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images WHERE drinkId = ?';

    db.all(sql, [drinkId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const images = rows.map(row => ({
          path: row.path,
        }));

        let img = ''
        if (images.length > 0) {
          img = images[0].path
        } 
        resolve(img);
      }
    });
  });
}

function getDrinksRecipe(drinkId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM drinks WHERE id = ?';

    db.all(sql, [drinkId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const drinks = rows.map(row => ({
          recipe: row.recipe,
        }));

        let recipe = ''
        if (drinks.length > 0) {
          recipe = drinks[0].recipe
        } 
        resolve(recipe);
      }
    });
  });
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
          name: row.name
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
          drinkId: row.drinkId,
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
    const formattedSubPrompt = formatSubPrompt(userMessage);
    conversationHistory.push({ role: 'user', content: formattedSubPrompt });
  }

  try {
    const response = await ollama.chat({
        model: 'gemma:2b',
        messages: conversationHistory,
    });

    const modifiedResponse = modifyResponse(response.message.content);

    let jsonResp = null
    if (modifiedResponse.json !== null) {
      imagePath = await getDrinksImg(modifiedResponse.json.id);
      recipe = await getDrinksImg(modifiedResponse.json.id);
      jsonResp = {
        name: modifiedResponse.json.name,
        ingredients: modifiedResponse.json.ingredients,
        description: recipe,
        image: imagePath
      };
    }

    const formattedResponse = {
      msg: modifiedResponse.msg,
      json: jsonResp
    }

    conversationHistory.push({ role: 'assistant', content: response.message.content });
    conversations[sessionId] = conversationHistory;

    res.json({ response: formattedResponse });

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
